export default function ServerDown() {
  return (
    <div className="h-screen grid place-items-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Service temporarily unavailable</h1>
        <p className="text-gray-600">Please try again later.</p>
      </div>
    </div>
  );
}
