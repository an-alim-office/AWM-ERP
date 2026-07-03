import cv2
import numpy as np
import os

DATASET_PATH = "dataset"
MODEL_PATH = "model.yml"

def train_model():
    print("🚀 Training started...")

    recognizer = cv2.face.LBPHFaceRecognizer_create()

    faces = []
    ids = []

    if not os.path.exists(DATASET_PATH):
        print("❌ Dataset folder not found!")
        return

    for file in os.listdir(DATASET_PATH):
        if file.endswith(".jpg") or file.endswith(".png"):
            path = os.path.join(DATASET_PATH, file)

            # Example filename: user.1.1.jpg
            try:
                user_id = int(file.split(".")[1])
            except:
                print(f"⚠️ Skipping invalid file: {file}")
                continue

            img = cv2.imread(path, cv2.IMREAD_GRAYSCALE)

            if img is None:
                print(f"⚠️ Failed to read: {file}")
                continue

            faces.append(img)
            ids.append(user_id)

    if len(faces) == 0:
        print("❌ No training data found!")
        return

    ids = np.array(ids)

    print(f"📊 Total faces: {len(faces)}")
    print(f"👤 Unique users: {len(set(ids))}")

    # Train model
    recognizer.train(faces, ids)

    # Save model
    recognizer.save(MODEL_PATH)

    print(f"✅ Model trained & saved as {MODEL_PATH}")


if __name__ == "_main_":
    train_model()