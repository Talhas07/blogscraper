"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circularProgress";
import { CircularProgress2 } from "@/components/ui/circularProgress2";
import { useEffect, useState } from "react";
import axios from "axios";
import { AppDispatch, persistor, RootState } from "@/redux/store/store";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { logout } from "@/redux/store/slices/userSlice";
import { AssessmentData, AssessmentStats } from "@/utils/types";

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.user.token);
  const userId = useSelector((state: any) => state.user.user?.id);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const [assessmentStats, setAssessmentStats] = useState<{
    implemented: number;
    partial: number;
    notImplemented: number;
    progress: number;
    total: number;
  }>({
    implemented: 0,
    partial: 0,
    notImplemented: 0,
    progress: 0,
    total: 1, // To avoid divide-by-zero
  });

  const [clients, setClients] = useState<any>([]);

  const calculateStats = (data: AssessmentData) => {
    const implemented = data.stats.implemented;
    const partial = data.stats.partial;
    const notImplemented = data.stats.notImplemented;
    const total = implemented + partial + notImplemented || 1;
    const progress = data.stats.progress;

    return {
      implemented,
      partial,
      notImplemented,
      progress,
      total,
    };
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const allClients = response.data.clients || [];
        console.log(allClients);
        const filteredClients = allClients.filter(
          (client: any) => client.assessment != null
        );
        setClients(filteredClients);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };

    fetchClients();
  }, []);
  const handleShowData = async (clientId: string) => {
    try {
      setSelectedClientId(clientId); // Highlight selected client
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/assessments/client/${clientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.data) {
        const parsedData = JSON.parse(response.data.data) as AssessmentData;
        const stats = calculateStats(parsedData);
        setAssessmentStats(stats);
      }
    } catch (error) {
      console.error("Error fetching assessment data:", error);
    }
  };

  const handleLogout = async () => {
    dispatch(logout());
    await persistor.purge();
    router.push("/auth/login");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          className="cursor-pointer px-4 py-2 border rounded"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* Graphs Always Visible */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
          </CardContent>
        </Card>

        <Card className="flex flex-row justify-between">
          <CardHeader className="flex flex-row justify-between">
            <CardTitle className="p-4 text-sm font-medium whitespace-nowrap">
              Average Compliance
            </CardTitle>
          </CardHeader>
          <div className="flex items-center justify-end w-full h-full pr-8">
            <CircularProgress
              value={assessmentStats.progress}
              size={72}
              strokeWidth={6}
              className="text-green-500"
              textClass="text-xs font-bold text-gray-700"
            />
          </div>
        </Card>
      </div>

      {/* Status Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 w-full">
        <div className="bg-white shadow-md rounded-2xl p-4 flex flex-col items-center">
          <CircularProgress2
            value={assessmentStats.implemented}
            total={assessmentStats.total}
            label="Implemented"
            colorClass="text-green-500"
          />
        </div>

        <div className="bg-white shadow-md rounded-2xl p-4 flex flex-col items-center">
          <CircularProgress2
            value={assessmentStats.partial}
            total={assessmentStats.total}
            label="Partial"
            colorClass="text-orange-500"
          />
        </div>

        <div className="bg-white shadow-md rounded-2xl p-4 flex flex-col items-center">
          <CircularProgress2
            value={assessmentStats.notImplemented}
            total={assessmentStats.total}
            label="Not Implemented"
            colorClass="text-red-500"
          />
        </div>
      </div>

      {/* Clients */}
      <h2 className="text-xl font-semibold mt-10">
        Client List with active assessments
      </h2>
      {clients?.length === 0 && (
        <div className="flex w-full justify-center ">
          No Clients found with active assessemnts{" "}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {clients.map((client: any) => (
          <Card
            key={client.id}
            className={`p-4 space-y-2 transition border-2 ${
              selectedClientId === client.id
                ? "border-blue-500 shadow-lg"
                : "border-transparent"
            }`}
          >
            <CardTitle className="text-md font-semibold">
              {client.name || "Unnamed Client"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Email: {client.email}
            </p>

            {selectedClientId !== client.id && (
              <button
                onClick={() => handleShowData(client.id)}
                className="mt-2 px-4 py-1 border rounded hover:bg-gray-100 transition"
              >
                Show Data
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
