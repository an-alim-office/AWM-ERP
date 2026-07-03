import cv2

def detect_face():
    # Open webcam
    cam = cv2.VideoCapture(0)

    # Load face cascade
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )

    if face_cascade.empty():
        print("Error loading cascade file")
        return

    while True:
        ret, frame = cam.read()
        if not ret:
            print("Failed to grab frame")
            break

        # Convert to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Detect faces
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.3,
            minNeighbors=5,
            minSize=(30, 30)
        )

        # Draw rectangle
        for (x, y, w, h) in faces:
            cv2.rectangle(
                frame,
                (x, y),
                (x + w, y + h),
                (0, 255, 0),
                2
            )

        # Show output
        cv2.imshow("Face Detection", frame)

        # Press Q to exit
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Release resources
    cam.release()
    cv2.destroyAllWindows()


if __name__ == "_main_":
    detect_face()