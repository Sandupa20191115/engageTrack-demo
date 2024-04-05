import cv2
import os

def extract_frames(input_video_path, output_folder_path):
    # Open the video file
    cap = cv2.VideoCapture(input_video_path)

    # Create the output folder if it doesn't exist
    os.makedirs(output_folder_path, exist_ok=True)

    # Get the frames and save them to the output folder
    
    success = True
    
    if not cap.isOpened():
        print("Error opening video")
        return False
    
    frame_count = 0
    while True:
        ret, frame = cap.read()

        if not ret:
            print("COULD NOT READ FRAMES")
            success = False
            break

        frame_count += 1

        # Save the frame as an image file
        frame_filename = f"frame_{frame_count:04d}.png"
        frame_path = os.path.join(output_folder_path, frame_filename)
        cv2.imwrite(frame_path, frame)

    # Release the video capture object
    cap.release()
    
    return success
    
# if __name__ == "__main__":
#     input_video_path = "C:/Users/sandu/Documents/IIT/Year4/Projectv1/Impl/yt-dashboard/Webcam Captures/db917fd7-c670-40a0-8623-89230f314113.avi"
#     output_folder_path = "C:/Users/sandu/Documents/IIT/Year4/Projectv1/Impl/yt-dashboard/api/Extracted Frames"
#
#     extract_frames(input_video_path, output_folder_path)