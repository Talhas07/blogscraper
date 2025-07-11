"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RootState } from "@/redux/store/store";

// Selector for userId
const selectUserId = (state: any) => state.user.user.id;

interface Client {
  id: number;
  name: string;
  email: string;
  assessment: any | null;
}

export default function ClientListPage() {
  const router = useRouter();
  const userId = useSelector(selectUserId);
  const token = useSelector((state: RootState) => state.user.token);
  const [clientsWithAssessment, setClientsWithAssessment] = useState<Client[]>(
    []
  );
  const [clientsWithoutAssessment, setClientsWithoutAssessment] = useState<
    Client[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // 🔥 Extracted fetching into its own function
  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/users/${userId}`
      );
      const allClients = response.data.clients || [];

      const withAssessment = allClients.filter((c: any) => c.assessment);
      const withoutAssessment = allClients.filter((c: any) => !c.assessment);

      setClientsWithAssessment(withAssessment);
      setClientsWithoutAssessment(withoutAssessment);
    } catch (error) {
      console.error("Failed to fetch clients", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchClients();
  }, [userId]);

  const filteredClients = clientsWithAssessment.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewAssessment = (clientId: number) => {
    router.push(`/dashboard/clients/assessments/${clientId}`);
  };

  const handleCreateAssessment = () => {
    if (selectedClientId) {
      router.push(`/dashboard/clients/assessments/${selectedClientId}`);
    }
  };

  // 🔥 DELETE handler
  const handleDeleteAssessment = async (clientId: number) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/assessments/client/${clientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      await fetchClients(); // 🔥 Refetch updated client list
    } catch (error) {
      console.error("Failed to delete assessment", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Clients</h1>

          <Dialog>
            <DialogTrigger asChild>
              <Button>Create New Assessment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Client </DialogTitle>
              </DialogHeader>

              <Select onValueChange={(value) => setSelectedClientId(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a client" />
                </SelectTrigger>
                <SelectContent>
                  {clientsWithoutAssessment.map((client) => (
                    <SelectItem key={client.id} value={String(client.id)}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                className="mt-4 w-full"
                onClick={handleCreateAssessment}
                disabled={!selectedClientId}
              >
                Proceed to Assessment
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="p-6 overflow-x-auto w-full">
          <div className="min-w-[768px]">
            <div className="p-4 mb-4 border rounded-md bg-white">
              <h2 className="text-xl font-semibold mb-1">Client Assessments</h2>
              <p className="text-sm text-gray-500 mb-4">
                View assessments of clients linked to your account.
              </p>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <div className="relative w-1/3">
                <Input
                  placeholder="Search clients"
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 items-center font-semibold text-gray-600 mb-2 px-4">
              <span>Client Name</span>
              <span>Actions</span>
              <span>Delete</span>
            </div>

            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="grid grid-cols-3 gap-4 items-center px-4 border-t text-sm py-4"
              >
                <span>{client.name}</span>
                <span>
                  <Button onClick={() => handleViewAssessment(client.id)}>
                    Assessment
                  </Button>
                </span>
                <span>
                  <Button onClick={() => handleDeleteAssessment(client.id)}>
                    Delete
                  </Button>
                </span>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
