from os import listdir
from os.path import join
from PIL import Image
import numpy as np
import tensorflow as tf
import time
import keras
import math
import cv2
import mediapipe as mp  # Import mediapipe


def distance(point1, point2):
    return math.dist([point1.x, point1.y], [point2.x, point2.y])


face_left_landmarks = [1, 2, 3, 7, 9, 0]
left_hand_landmarks = [21, 15, 19, 17]

face_right_landmarks = [6, 5, 4, 8, 10, 0]
right_hand_landmarks = [20, 18, 22, 16]

mp_drawing = mp.solutions.drawing_utils  # Drawing helpers
mp_holistic = mp.solutions.holistic  # Mediapipe Solutions


def getlistpreds(framesDir, noFrames):
    pose_model = keras.models.load_model("./Models/pose_estimatorV1.h5")

    predsList = []

    with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:

        for frameName in sorted(listdir(framesDir))[:noFrames]:

            # ret, frame = cap.read()
            framePath = framesDir + "/" + frameName
            # print(framePath)
            frame = cv2.imread(framePath)

            # Recolor Feed
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False

            # Make Detections
            results = holistic.process(image)
            # print(results.face_landmarks)

            # face_landmarks, pose_landmarks, left_hand_landmarks, right_hand_landmarks

            # Recolor image back to BGR for rendering
            image.flags.writeable = True
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

            try:
                # Extract Pose landmarks
                landmarks = results.pose_landmarks.landmark
                # print("Got landmarks")
                row = []
                # adding distances calculated to new list
                for lndmrkFacein in face_left_landmarks:
                    for lndmrkLeft in left_hand_landmarks:
                        row.append(distance(landmarks[lndmrkFacein], landmarks[lndmrkLeft]))

                for lndmrkFacein in face_right_landmarks:
                    for lndmrkRight in right_hand_landmarks:
                        row.append(distance(landmarks[lndmrkFacein], landmarks[lndmrkRight]))

                # print("got row")
                # Make Detections
                rowArr = np.array(row)
                rowArr = np.expand_dims(rowArr, axis=0)
                prediction = pose_model.predict(rowArr, verbose=0)[0][0]

                predsList.append(prediction)

            except:
                print(f"Error in pose detection {frameName}")
                return -1

    # return predsList

    # Convert the list to a NumPy array
    return np.array(predsList)


def evaluate(testingPath, model,noFrames, sequenceSize=5, usePose=False):
    print("inside new evaluate")
    if len(listdir(testingPath)) == 0 or len(listdir(testingPath)) < sequenceSize:
        return -1


    if len(tf.config.list_physical_devices('GPU')) == 0:
        print("On CPU")
    else:
        print(f"On GPU")

    start_time = time.time()

    sz = noFrames
    test = np.zeros(shape=(sz, 256, 256, 1))
    cnt = 0
    print("Starting to evaluate - " + testingPath)
    for f in sorted(listdir(testingPath))[:sz]:
        if str(join(testingPath, f))[-3:] == "png":
            img = Image.open(join(testingPath, f)).resize((256, 256))
            img = img.convert('L')
            img = np.array(img, dtype=np.float32) / 256.0
            test[cnt, :, :, 0] = img
            cnt = cnt + 1

    sz = test.shape[0] - sequenceSize + 1
    sequences = np.zeros((sz, sequenceSize, 256, 256, 1))
    # apply the sliding window technique to get the sequences
    for i in range(0, sz):
        clip = np.zeros((sequenceSize, 256, 256, 1))
        for j in range(0, sequenceSize):
            clip[j] = test[i + j, :, :, :]
        sequences[i] = clip

    # print("got data")
    print(f"Model's input sequence shape : {sequences.shape}")
    # return sequences

    # get the reconstruction cost of all the sequences
    reconstructed_sequences = model.predict(sequences, batch_size=1)
    # print("got reconstruction")
    # get the regularity scores
    sequences_reconstruction_cost = np.array(
        [np.linalg.norm(np.subtract(sequences[i], reconstructed_sequences[i])) for i in range(0, sz)])
    # print("got cost")
    sa = (sequences_reconstruction_cost - np.min(sequences_reconstruction_cost)) / np.max(sequences_reconstruction_cost)
    sr = 1.0 - sa

    # =----------------------------------------------

    # Example array
    if (usePose):
        print("Evaluating Pose...")
        array = getlistpreds(testingPath, noFrames)

        # Define the window size
        window_size = sequenceSize

        # Initialize a list to store the averages of each window
        window_averages = []

        # Generate all window positions
        for i in range(len(array) - window_size + 1):
            window = array[i:i + window_size]
            window_average = np.mean(window)
            window_averages.append(window_average)

        # Convert the list of window averages to a numpy array
        window_averages = np.array(window_averages)

        print("Evaluating Pose... Done")
        sr = sr - (1 - window_averages)

    # -------------------------------------------------------
    end_time = time.time()
    print(f"Time taken: {round(end_time - start_time)} seconds")

    return sr
