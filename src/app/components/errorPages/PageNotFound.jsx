"use client"
import { useRouter } from 'next/navigation'
export default function PageNotFound() {
    const router = useRouter();

    function goBack(){
        router.back();
    }
    
  return (
    <div className='text-center mt-20 p-10'>
      <h2 className='text-3xl font-bold'>Not Found</h2>
      <p className='mb-10 mt-5'>Could not find requested resource.</p>
      <button onClick={goBack} className='items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'>Go back</button>
    </div>
  )
}