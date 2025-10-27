import { useEffect, useState } from "react";
import axiosInstance from "../utils/axios";

const ReferredUsers = () => {
  const [referredUsers, setReferredUsers] = useState([]);

  const fetchReferredUsers = async () => {
    try {
      const res = await axiosInstance.get("/user/referrals", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bfm-token")}`,
        },
      });
      setReferredUsers(res.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchReferredUsers();
  }, []);

  return (
    <div className="relative z-10 mx-2 mt-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-lg border-2 border-white px-4 py-2">
          <span className="text-sm font-medium text-white">
            FRIENDS(LEVEL-1) {referredUsers.length}
          </span>
        </div>
        <div className="rounded-lg border-2 border-white px-4 py-2">
          <span className="text-sm font-medium text-white">#READ</span>
        </div>
      </div>

      <div className="space-y-4">
        {referredUsers?.map((friend, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-b border-gray-600 pb-2"
          >
            <span className="text-base font-medium text-white">
              {friend?.telegram?.first_name || "Friend"}
            </span>
            <span className="text-base text-white">2000</span>
          </div>
        ))}

        {referredUsers?.length === 0 && (
          <div className="text-center text-white">No referrals yet</div>
        )}
      </div>
    </div>
  );
};

export default ReferredUsers;
