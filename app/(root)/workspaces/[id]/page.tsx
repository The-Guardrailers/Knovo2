import { Shield, Users, Crown, Mail } from "lucide-react";

export default function WorkspaceOverviewPage() {
  const admins = [
    {
      name: "Dive",
      role: "Owner",
      email: "dive@knovo.com",
      initial: "D",
      color: "bg-indigo-500",
    },
    {
      name: "Sarah Connor",
      role: "Admin",
      email: "sarah@knovo.com",
      initial: "S",
      color: "bg-emerald-500",
    },
  ];

  const members = [
    {
      name: "Mike Ross",
      role: "Member",
      email: "mike@example.com",
      initial: "M",
      color: "bg-amber-500",
    },
    {
      name: "Alex Chen",
      role: "Member",
      email: "alex@example.com",
      initial: "A",
      color: "bg-rose-500",
    },
    {
      name: "David Kim",
      role: "Member",
      email: "david@example.com",
      initial: "D",
      color: "bg-blue-500",
    },
    {
      name: "Elena Rodriguez",
      role: "Member",
      email: "elena@example.com",
      initial: "E",
      color: "bg-purple-500",
    },
    {
      name: "James Holden",
      role: "Member",
      email: "james@example.com",
      initial: "J",
      color: "bg-cyan-500",
    },
    {
      name: "Naomi Nagata",
      role: "Member",
      email: "naomi@example.com",
      initial: "N",
      color: "bg-teal-500",
    },
    {
      name: "Amos Burton",
      role: "Member",
      email: "amos@example.com",
      initial: "A",
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="p-6 sm:p-10 w-full space-y-10">
      <div>
        <h1 className="text-4xl font-black text-white mb-2">
          Workspace Members
        </h1>
        <p className="text-gray-400 text-lg">
          Manage your group, view admins, and invite new people.
        </p>
      </div>

      <div className="space-y-10">
        {/* Admins Section */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-gray-800 pb-2">
            <Crown className="w-5 h-5 text-amber-400" /> Administrators
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
            {admins.map((admin, idx) => (
              <div
                key={idx}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4 hover:border-gray-700 transition-colors shadow-lg"
              >
                <div
                  className={`w-14 h-14 rounded-full ${admin.color} flex items-center justify-center text-white font-black text-xl shadow-inner`}
                >
                  {admin.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-lg truncate">
                    {admin.name}
                  </p>
                  <p className="text-sm text-gray-400 flex items-center gap-1.5 truncate mt-0.5">
                    <Mail className="w-3.5 h-3.5" /> {admin.email}
                  </p>
                </div>
                <div className="px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-black rounded-lg uppercase tracking-wider">
                  {admin.role}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Members Section */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-gray-800 pb-2">
            <Users className="w-5 h-5 text-indigo-400" /> Members (
            {members.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pt-2">
            {members.map((member, idx) => (
              <div
                key={idx}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4 hover:border-gray-700 transition-colors shadow-lg"
              >
                <div
                  className={`w-12 h-12 rounded-full ${member.color} flex items-center justify-center text-white font-bold text-lg shadow-inner`}
                >
                  {member.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-base truncate">
                    {member.name}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 truncate mt-0.5">
                    <Mail className="w-3.5 h-3.5" /> {member.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
