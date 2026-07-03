import cv2

def verify_face():
    # Load trained model
    recognizer = cv2.face.LBPHFaceRecognizer_create()
    
    try:
        recognizer.read("model.yml")
    except:
        print("❌ Model file not found! Please run train-model.py first")
        return

    # Load face detector
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )

    if face_cascade.empty():
        print("❌ Error loading cascade file")
        return

    # Start camera
    cam = cv2.VideoCapture(0)

    if not cam.isOpened():
        print("❌ Camera not accessible")
        return

    print("✅ Face verification started... Press 'q' to exit")

    while True:
        ret, frame = cam.read()
        if not ret:
            print("❌ Failed to read frame")
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.3,
            minNeighbors=5,
            minSize=(30, 30)
        )

        for (x, y, w, h) in faces:
            face_roi = gray[y:y+h, x:x+w]

            try:
                user_id, confidence = recognizer.predict(face_roi)
            except:
                continue

            # Confidence convert to %
            confidence_score = round(100 - confidence, 2)

            # Threshold check
            if confidence < 70:
                label = f"User-{user_id} ({confidence_score}%)"
                color = (0, 255, 0)  # Green
            else:
                label = "Unknown"
                color = (0, 0, 255)  # Red

            # Draw rectangle
            cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)

            # Put text
            cv2.putText(
                frame,
                label,
                (x, y - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                color,
                2
            )

        # Show window
        cv2.imshow("Face Verification", frame)

        # Exit
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Cleanup
    cam.release()
    cv2.destroyAllWindows()


if __name__ == "_main_":
    verify_face()