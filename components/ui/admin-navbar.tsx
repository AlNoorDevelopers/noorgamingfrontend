export function AdminNavBar() {
  return (
    <div className="bg-gray-800 border-b border-cyan-500/30 min-h-[60px] flex items-center w-full">
      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="flex space-x-8">
          <div className="text-white py-4 px-2 text-sm font-bold">ADMIN NAVIGATION:</div>
          <a href="/admin/dashboard" className="py-4 px-2 text-sm font-medium text-yellow-400 hover:text-cyan-400">Dashboard</a>
          <a href="/admin/stations" className="py-4 px-2 text-sm font-medium text-gray-300 hover:text-cyan-400">Stations</a>
          <a href="/admin/bookings" className="py-4 px-2 text-sm font-medium text-gray-300 hover:text-cyan-400">Bookings</a>
          <a href="/admin/users" className="py-4 px-2 text-sm font-medium text-gray-300 hover:text-cyan-400">Users</a>
          <a href="/admin/analytics" className="py-4 px-2 text-sm font-medium text-gray-300 hover:text-cyan-400">Analytics</a>
          <a href="/admin/settings" className="py-4 px-2 text-sm font-medium text-gray-300 hover:text-cyan-400">Settings</a>
        </div>
      </div>
    </div>
  )
} 