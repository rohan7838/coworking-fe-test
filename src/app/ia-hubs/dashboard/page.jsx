import { options } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";


const Dashboard = async() => {
  const userSession = await getServerSession(options);

  return (
    // <div className="min-h-screen bg-slate-50">
    //   <div className="w-4/5 max-w-6xl m-auto py-5">
    //       <div className="w-full bg-slate-100 shadow items-center p-5 rounded h-20 bg-cover">
    //           <p className=" font-semibold">Hi, welcome back!</p>
    //           <p>{userSession?.user?.email}</p>
    //       </div>
    //   </div>
    // </div>
    <main className="flex-1">
      <div className="py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          {/* Replace with your content */}
          <div>
            <div className="">
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  <p className="border-transparent font-semibold mt-5 text-gray-500 hover:text-gray-700 hover:border-gray-200 whitespace-nowrap flex px py-2 p border-b-2">
                    Hi,&nbsp;<span className="text-gray-500"> {userSession?.user?.email}</span>
                  </p>
                </nav>
              </div>
              {/* Cards */}
              
            </div>
          </div>
          {/* /End replace */}
        </div>
      </div>
    </main>
  )
}

export default Dashboard