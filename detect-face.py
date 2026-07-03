import cv2

def run_face_detection():
    # Load Haar Cascade
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )

    if face_cascade.empty():
        print("❌ Error loading cascade file")
        return

    # Open Camera
    cam = cv2.VideoCapture(0)

    if not cam.isOpened():
        print("❌ Cannot access camera")
        return

    print("🚀 Face Detection Running (Press 'q' to exit)")

    while True:
        ret, frame = cam.read()

        if not ret:
            print("❌ Failed to read frame")
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

        # Exit key
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cam.release()
    cv2.destroyAllWindows()


if __name__ == "_main_":
    run_face_detection()