"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { AssessmentData, AssessmentStats } from "@/utils/types";
import { useEffect, useState } from "react";
import axios from "axios";
import { CircularProgress } from "@/components/ui/circularProgress";
import { CircularProgress2 } from "@/components/ui/circularProgress2";
import { AppDispatch, persistor, RootState } from "@/redux/store/store";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { logout } from "@/redux/store/slices/userSlice";

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.user.token);
  const userId = useSelector((state: any) => state.user.user?.id);
  const [assessmentStats, setAssessmentStats] = useState<
    (AssessmentStats & { progress: number; total: number }) | null
  >(null);

  const calculateStats = (data: AssessmentData) => {
    let implemented = data.stats.implemented;
    let partial = data.stats.partial;
    let notImplemented = data.stats.notImplemented;

    let total = implemented + partial + notImplemented;
    let progress = data.stats.progress;
    return {
      total,
      implemented,
      partial,
      notImplemented,
      notApplicable: 0,
      progress,
    };
  };

  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/assessments/client/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        // Check if we have valid data before parsing
        if (response.data?.data) {
          const parsedData = JSON.parse(response.data.data) as AssessmentData;
          console.log("Parsed Data:", parsedData);
          const stats = calculateStats(parsedData);
          setAssessmentStats(stats);
        }
      } catch (error) {
        console.error("Error fetching assessment:", error);
      }
    };

    fetchAssessmentData();
  }, []);

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

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            {/* <p className="text-xs text-muted-foreground">+2 from last month</p> */}
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
            {/* <p className="text-xs text-muted-foreground">-1 from last month</p> */}
          </CardContent>
        </Card>
        <Card className="flex flex-row justify-between ">
          <CardHeader className="flex flex-row  justify-between">
            <CardTitle className="p-4 text-sm font-medium whitespace-nowrap">
              Average Compliance
            </CardTitle>
          </CardHeader>
          <div className="flex items-center justify-end w-full h-full pr-8">
            <CircularProgress
              value={assessmentStats ? assessmentStats.progress : 0}
              size={72} // ⬅️ this works directly
              strokeWidth={6}
              className="text-green-500" // sets the stroke color
              textClass="text-xs font-bold text-gray-700"
            />
          </div>
        </Card>
        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Critical Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">-3 from last month</p>
          </CardContent>
        </Card> */}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 w-full">
        <div className="bg-white shadow-md rounded-2xl p-4 flex flex-col items-center">
          <CircularProgress2
            value={assessmentStats ? assessmentStats.implemented : 0}
            total={assessmentStats?.total}
            label="Implemented"
            colorClass="text-green-500"
          />
        </div>

        <div className="bg-white shadow-md rounded-2xl p-4 flex flex-col items-center">
          <CircularProgress2
            value={assessmentStats ? assessmentStats.partial : 0}
            total={assessmentStats?.total}
            label="Partial"
            colorClass="text-orange-500"
          />
        </div>

        <div className="bg-white shadow-md rounded-2xl p-4 flex flex-col items-center">
          <CircularProgress2
            value={assessmentStats ? assessmentStats.notImplemented : 0}
            total={assessmentStats?.total}
            label="Not Implemented"
            colorClass="text-red-500"
          />
        </div>
      </div>

      {/* <AreaChartt /> */}
      <h2 className="text-xl font-semibold mt-6">Recent Assessments</h2>
      <div className="grid gap-4">
        {[1].map((i) => (
          <Card key={i} className="hover:bg-gray-50 transition-colors">
            <CardHeader className="pb-2">
              <Link href={`/dashboard/assessments/${i}`}>
                <CardTitle className="text-lg font-medium">
                  {i === 1
                    ? "E8 Assessment"
                    : i === 2
                    ? "Q2 2023 Essential Eight Assessment"
                    : "ISO 27001 Gap Analysis"}
                </CardTitle>
              </Link>
              <div className="text-sm text-muted-foreground">
                Last updated:{" "}
                {i === 1 ? "3/4/2024" : i === 2 ? "2/15/2024" : "1/22/2024"}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Progress
                  value={
                    i === 1
                      ? parseInt(
                          `${assessmentStats ? assessmentStats.progress : 0}`
                        )
                      : i === 2
                      ? 45
                      : 90
                  }
                  className="h-2 flex-1"
                />
                <span className="text-sm font-medium">
                  {i === 1
                    ? `${assessmentStats ? assessmentStats.progress : 0}%`
                    : i === 2
                    ? "45%"
                    : "90%"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
