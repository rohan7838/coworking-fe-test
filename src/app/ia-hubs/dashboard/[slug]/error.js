'use client'
 
export default function Error({ error, reset }) {
  
  return (
    <div className="w-full mt-10 flex flex-col items-center justify-center">
      <h2 className="my-5 p-10 rounded bg-gray-200 text-red-500">Something went wrong!</h2>
      <button className="bg-blue-500 text-white px-3 py-2 rounded" onClick={() => reset()}>Try again</button>
    </div>
  )
}