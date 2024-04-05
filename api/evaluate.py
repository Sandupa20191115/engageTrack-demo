from os import listdir
from os.path import join
from PIL import Image
import numpy as np
import tensorflow as tf
import time
import keras

def evaluateFrame(testingPath,model,noFrames,sequenceSize):

    if len(tf.config.list_physical_devices('GPU')) == 0:
        print("On CPU")
    else:
        print("On GPU")

    start_time = time.time()

    sz = noFrames
    test = np.zeros(shape=(sz, 256, 256, 1))
    cnt = 0
    print("Starting to evaluate - "+testingPath)
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
    reconstructed_sequences = model.predict(sequences,batch_size=1)
    # print("got reconstruction")
    # get the regularity scores
    sequences_reconstruction_cost = np.array([np.linalg.norm(np.subtract(sequences[i],reconstructed_sequences[i])) for i in range(0,sz)])
    # print("got cost")
    sa = (sequences_reconstruction_cost - np.min(sequences_reconstruction_cost)) / np.max(sequences_reconstruction_cost)
    sr = 1.0 - sa

    end_time = time.time()
    print(f"Time taken: {round(end_time - start_time)} seconds")

    return sr