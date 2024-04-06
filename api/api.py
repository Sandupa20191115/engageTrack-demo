import os
from flask import Flask
from flask_cors import CORS, cross_origin
from io import BytesIO
from flask import jsonify, request
from werkzeug.utils import secure_filename
from pymongo import MongoClient

import uuid
import time
import random
import matplotlib.pyplot as plt
import os
import keras
import json
import numpy as np

# Importing functions
from evaluate_full import evaluate
from evaluate import evaluateFrame
import glob
from extract_frames import extract_frames


# TODO:MOVE TO UTILITY
def cls():
    os.system('cls' if os.name == 'nt' else 'clear')


def clearExtractingFrames():
    # Removing files from Extracted_frames
    print("Cleaning Extracted Frames")
    import os, shutil
    folder = "./Extracted Frames"
    for filename in os.listdir(folder):
        file_path = os.path.join(folder, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            print('Failed to delete %s. Reason: %s' % (file_path, e))
    print("Done cleaning Extracted Frames")


app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# connecting to db
client = MongoClient("localhost", 27017)
db = client.fypProto

users = db.users  # evalutations

# loading ML Model
print("Model load initiated")
model = keras.models.load_model("./Models/model_seq5_vid10_epoch15.hdf5")
print("Model load successful")


@app.route("/status")
@cross_origin()
def get_status():
    return {'status': True}


@app.route("/getEvaluations", methods=['GET'])
@cross_origin()
def testDB_get():
    # Retrieve all documents from the users collection
    cls()
    user_objects = []
    for user in list(users.find({}, {'_id': False})):
        user_objects.append(user)

    return {'users': user_objects}


@app.route("/evaluate/<id>")
@cross_origin()
def evaluateWebcam(id):
    cls()
    print("Hit with id of " + id)

    response = {"Success": False}

    clearExtractingFrames()

    # Extracting frames
    print("Extracting frames")
    input_video_path = f"C:/Users/sandu/Documents/IIT/Year4/Projectv1/Impl/yt-dashboard/Webcam Captures/{id}.avi"
    #     input_video_path=f"C:/Users/sandu/Documents/IIT/Year4/Projectv1/Impl/yt-dashboard/Webcam Captures/{id}"
    print(input_video_path)
    #     return {"Success" : True}

    # C:\Users\sandu\Documents\IIT\Year4\Projectv1\Impl\yt-dashboard\Webcam Captures\7a8c8588-c870-4ed9-83fd-1b563b42fe43.avi
    extract_frames(input_video_path=input_video_path, output_folder_path="./Extracted Frames")
    print("Done Extracting frames")

    try:
        testingPath = "C:/Users/sandu/Documents/IIT/Year4/Projectv1/Impl/yt-dashboard/api/Extracted Frames"

        frameNo = len(os.listdir(testingPath))
        seqSize = 5

        print("Starting prediction")
        scores = evaluateFrame(model=model, testingPath=testingPath, noFrames=frameNo, sequenceSize=seqSize)
        print("Done prediction")

        users.insert_one({"id": id, "type": "Capture", "scores": scores.tolist()})
        print("Saved to DB")

        response = jsonify({"Success": True, "Error": None, "data": scores.tolist()})

    except:
        response = {"Success": False}

    finally:
        return response


UPLOAD_FOLDER = os.path.abspath(os.path.dirname(__file__)) + '/Downloads/'
ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif',
                          'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv', 'zip', 'rar', 'mp4',
                          'mp3', 'wav', 'avi', 'mkv', 'flv', 'mov', 'wmv', 'webm'])


def allowedFile(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/upload', methods=['POST', 'GET'])
@cross_origin()
def fileUpload():
    cls()
    response = {"Success": False, "Error": "Something went wrong", "data": None}

    if request.method == 'POST':
        file = request.files.getlist('file')
        for f in file:
            filename = secure_filename(f.filename)
            if allowedFile(filename):
                f.save(os.path.join(UPLOAD_FOLDER, filename))  # save file to local
            else:
                return jsonify({'message': 'File type not allowed'}), 400

        # File is saved
        clearExtractingFrames()

        # Extracting frames
        print("Extracting frames")
        input_video_path = os.path.join(UPLOAD_FOLDER, filename)
        extract_frames(input_video_path=input_video_path, output_folder_path="./Extracted Frames")
        print("Done Extracting frames")

        try:
            testingPath = "./Extracted Frames"

            frameNo = len(os.listdir(testingPath))
            print(f"sz is {frameNo}")
            seqSize = 5

            print("Starting prediction")
            #scores = evaluateFrame(model=model,testingPath=testingPath,noFrames=frameNo,sequenceSize=seqSize)

            scores = evaluate(testingPath, model, frameNo, 5, True)

            print("Done prediction")

            # Appening the new element to the json file
            users.insert_one({"id": str(uuid.uuid4()), "type": "upload", "scores": scores.tolist()})
            print("Saved to DB")

            response = jsonify({"Success": True, "Error": None, "data": scores.tolist()})

        except:
            response = jsonify({"Success": False, "Error": "Evaluation Failed", "data": None})

        finally:
            return response

        # return jsonify({"name": filename, "status": "success"})
    else:
        response = {"Success": False, "Error": "Invalid file type", "data": None}
        return jsonify(response)


if __name__ == '__main__':
    app.run()
