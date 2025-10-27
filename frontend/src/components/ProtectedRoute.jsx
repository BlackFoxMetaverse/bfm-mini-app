import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/api/user";

export default function ProtectedRoute({ children }) {
  // 3. Server-side validation
  const { data, isLoading, isError } = useQuery({
    queryKey: ["profile"],
    queryFn: getUserProfile,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        Loading ....
      </div>
    );
  }

  if (isError || !data?.data) {
    return <Navigate to="/" replace />;
  }

  return children;
}
