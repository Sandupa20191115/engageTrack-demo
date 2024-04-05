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

#Importing functions
from evaluate import evaluateFrame
import glob
from extract_frames import extract_frames

#TODO:MOVE TO UTILITY
def cls():
    os.system('cls' if os.name=='nt' else 'clear')

def clearExtractingFrames():
    # Removing files from Extracted_frames
    print("Clearning Extracted_frames")
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
    print("Done Clearning Extracted_frames")

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

#connecting to db
client = MongoClient("localhost",27017)
db = client.fypProto

users = db.users

for user in users.find():
    print(user)

#loading ML Model
print("Model load initiated")
model = keras.models.load_model("./Models/model_seq5_vid10_epoch15.hdf5")
print("Model load successful")

@app.route("/status")
@cross_origin()
def get_status():
    return {'status' : True}

@app.route("/testDB_push/<id>")
@cross_origin()
def testDB_put(id):
    users.insert_one({"id" : str(uuid.uuid4()) ,"name" : "sandu" ,"age" : id})
    return {'status' : True}

@app.route("/getEvaluations", methods=['GET'])
@cross_origin()
def testDB_get():
    # Retrieve all documents from the users collection
    cls()
    user_objects = []
    for user in list(users.find({},{'_id': False})):
        user_objects.append(user)

    return {'users': user_objects}


@app.route("/evaluate/<id>")
@cross_origin()
def evaluateWebcam(id,):
    cls()
    print("Hit with id of "+id)
    # print("Hit with seq size of "+seqSize)
    # print("Hit with frame no of "+frameNo)
    
    # return {"Success" : True}
    
    response = {"Success" : False}
    
    clearExtractingFrames()
    
    #Extracting frames
    print("Extracting frames")
    input_video_path=f"C:/Users/sandu/Documents/IIT/Year4/Projectv1/Impl/react-flask-proto/Video Captures/capture-{id}.avi"
    extract_frames(input_video_path=input_video_path,output_folder_path="./Extracted_frames")    
    print("Done Extracting frames")
    
    try:
        testingPath = "C:/Users/sandu/Documents/IIT/Year4/Projectv1/Impl/react-flask-proto/api/Extracted_frames"
        # testingPath = "C:/Users/sandu/Documents/IIT/Year4/Projectv1/Impl/react-flask-proto/Testing Videos/Boredom_556463022"
    
        frameNo = len(os.listdir(testingPath))
        seqSize = 5
        
        print("Starting prediction")
        scores = evaluateFrame(model=model,testingPath=testingPath,noFrames=frameNo,sequenceSize=seqSize)
        print("Done prediction")
        
        # Appening the new element to the json file
        json_file_path = "../public/results.json"  # Absolute path to the JSON file
        dummy_element = {
            "id": "base ID",
            "type": "webcam",
            "score": 0.5,
            "levels": scores.tolist()
        }
        
        # Open the JSON file and append the dummy data
        with open(json_file_path, 'r') as file:
            data = json.load(file)
            data.append(dummy_element)
        
        # Write back the updated data to the JSON file
        with open(json_file_path, 'w') as file:
            json.dump(data, file, indent=4)
        
        response = jsonify({"Success" : True,"Error" : None , "data" : scores.tolist()})   

    except:
        response = {"Success" : False}
        
    finally:    
        return response

UPLOAD_FOLDER = os.path.abspath(os.path.dirname(__file__)) + '/Downloads/'
ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif',
                          'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv', 'zip', 'rar', 'mp4',
                          'mp3', 'wav', 'avi', 'mkv', 'flv', 'mov', 'wmv','webm'])


def allowedFile(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST', 'GET'])
@cross_origin()
def fileUpload():
    cls()
    response = {"Success" : False,"Error" : "Something went wrong" , "data" : None}
    
    if request.method == 'POST':
        file = request.files.getlist('file')
        for f in file:
            filename = secure_filename(f.filename)
            if allowedFile(filename):
                f.save(os.path.join(UPLOAD_FOLDER, filename)) #save file to local
            else:
                return jsonify({'message': 'File type not allowed'}), 400
                
        #File is saved
        clearExtractingFrames()
    
        #Extracting frames
        print("Extracting frames")
        input_video_path=os.path.join(UPLOAD_FOLDER, filename)
        extract_frames(input_video_path=input_video_path,output_folder_path="./Extracted Frames")    
        print("Done Extracting frames")
        
        try:
            testingPath = "./Extracted Frames"
        
            frameNo = len(os.listdir(testingPath))
            seqSize = 5
            
            print("Starting prediction")
            scores = evaluateFrame(model=model,testingPath=testingPath,noFrames=frameNo,sequenceSize=seqSize)
            print("Done prediction")
            
            # Appening the new element to the json file
            users.insert_one({"id" : str(uuid.uuid4()) ,"type" : "upload" ,"scores" : scores.tolist()})
            print("Saved to DB")

            response = jsonify({"Success" : True,"Error" : None , "data" : scores.tolist()})

        except:
            response = jsonify({"Success" : False,"Error" : "Evaluation Failed" , "data" : None})
            
        finally:    
            return response
            
        
        # return jsonify({"name": filename, "status": "success"})
    else:
        response = {"Success" : False,"Error" : "Invalid file type" , "data" : None}
        return jsonify(response)


@app.route("/evaluateOK/<id>")
@cross_origin()
def evaluateWebcamOK(id):
    cls()    
    length = np.random.choice([100, 200])

    # Generate a 1D NumPy array with random values between 0 and 1
    array_1d = np.random.rand(length)
    
    print(f"got hit with id {id}")
    
    time.sleep(3)
    
    if id=="5":
        return jsonify({"Success" : True,"Error" : None , "data" : array_1d.tolist() , "value" : 0})   
    else :
        return jsonify({"Success" : False,"Error" : "Something Went Wrong" , "data" : None})   



if __name__ == '__main__':
    app.run()