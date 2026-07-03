import cv2
import csv
import os
from datetime import datetime

MODEL_PATH = "model.yml"
ATTENDANCE_FILE = "attendance.csv"

# ✅ Mark attendance (no duplicate same day)
def mark_attendance(name):
    today = datetime.now().strftime("%Y-%m-%d")

    # Create file if not exists
    if not os.path.exists(ATTENDANCE_FILE):
        with open(ATTENDANCE_FILE, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["Name", "Date", "Time"])

    existing = set()

    with open(ATTENDANCE_FILE, "r") as f:
        reader = csv.reader(f)
        next(reader, None)
        for row in reader:
            existing.add((row[0], row[1]))  # (name, date)

    if (name, today) in existing:
        return  # Already marked today

    now = datetime.now()
    time = now.strftime("%H:%M:%S")

    with open(ATTENDANCE_FILE, "a", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([name, today, time])

    print(f"✅ Attendance marked: {name} ({today} {time})")


def run_attendance():
    recognizer = cv2.face.LBPHFaceRecognizer_create()

    try:
        recognizer.read(MODEL_PATH)
    except:
        print("❌ Model not found! Run train-model.py first")
        return

    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )

    if face_cascade.empty():
        print("❌ Cascade load error")
        return

    cam = cv2.VideoCapture(0)

    if not cam.isOpened():
        print("❌ Camera not accessible")
        return

    print("🚀 Attendance system running (press 'q' to exit)")

    while True:
        ret, frame = cam.read()
        if not ret:
            print("❌ Camera read failed")
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.3,
            minNeighbors=5,
            minSize=(30, 30)
        )

        for (x, y, w, h) in faces:
            face_img = gray[y:y+h, x:x+w]

            try:
                user_id, confidence = recognizer.predict(face_img)
            except:
                continue

            confidence_score = round(100 - confidence, 2)

            if confidence < 70:
                name = f"User-{user_id}"
                color = (0, 255, 0)

                # Mark attendance
                mark_attendance(name)

                label = f"{name} ({confidence_score}%)"
            else:
                label = "Unknown"
                color = (0, 0, 255)

            cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
            cv2.putText(
                frame,
                label,
                (x, y - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                color,
                2
            )

        cv2.imshow("Face Attendance System", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cam.release()
    cv2.destroyAllWindows()


if __name__ == "_main_":
    run_attendance()