"use client";

export default function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white p-4 rounded shadow">
        ⏳ Loading...
      </div>
    </div>
  );
}