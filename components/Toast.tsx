"use client";

type Props = {
  message: string;
  type?: "success" | "error";
};

export default function Toast({ message, type = "success" }: Props) {
  return (
    <div
      className={`fixed top-5 right-5 px-4 py-2 rounded text-white shadow z-50
      ${type === "success" ? "bg-green-600" : "bg-red-600"}`}
    >
      {message}
    </div>
  );
}