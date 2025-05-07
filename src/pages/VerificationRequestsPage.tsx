// src/pages/VerificationRequestsPage.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Center,
  Spinner,
  Text,
  Link,
  Button,
  Drawer,
  chakra,
} from "@chakra-ui/react";
import { Table } from "@chakra-ui/react";
import { Image } from "@chakra-ui/react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import { showToast } from "../components/Toaster";

interface VerificationRequest {
  id: string;
  userId: string;
  email: string;
  docUrl: string;
  createdAt: any;
}

export const VerificationRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setOpen] = useState(false);
  const [selected, setSelected] = useState<VerificationRequest | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "verificationRequests"),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, async (snap) => {
      const arr = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data() as any;
          console.log(data);
          const userSnap = await getDoc(doc(db, "users", data.userId));
          return {
            id: d.id,
            userId: data.userId,
            email: userSnap.exists() ? userSnap.data().email : "—",
            docUrl: data.docUrl,
            createdAt: data.createdAt,
          } as VerificationRequest;
        })
      );
      setRequests(arr);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const openDrawer = (req: VerificationRequest) => {
    setSelected(req);
    setOpen(true);
  };
  const closeDrawer = () => {
    if (!processing) {
      setOpen(false);
      setSelected(null);
    }
  };

  const handleApprove = async () => {
    if (!selected) return;
    setProcessing(true);
    try {
      await updateDoc(doc(db, "users", selected.userId), { verified: true });
      await updateDoc(doc(db, "verificationRequests", selected.id), {
        status: "approved",
      });
      showToast({
        title: "Utente verificato",
        status: "success",
      });
      closeDrawer();
    } catch (err: any) {
      showToast({
        title: "Errore",
        description: err.message || "Impossibile approvare",
        status: "error",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selected) return;
    setProcessing(true);
    try {
      await updateDoc(doc(db, "verificationRequests", selected.id), {
        status: "rejected",
      });
      showToast({ title: "Richiesta rifiutata", status: "info" });
      closeDrawer();
    } catch (err: any) {
      showToast({
        title: "Errore",
        description: err.message || "Impossibile rifiutare",
        status: "error",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Center py={10}>
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box p={4}>
      {requests.length === 0 ? (
        <Center py={10}>
          <Text>Nessuna richiesta di verifica pendente</Text>
        </Center>
      ) : (
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Email</Table.ColumnHeader>
              <Table.ColumnHeader>Data richiesta</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {requests.map((req) => (
              <Table.Row
                key={req.id}
                cursor="pointer"
                _hover={{ bg: "gray.50" }}
                onClick={() => openDrawer(req)}
              >
                <Table.Cell>{req.email}</Table.Cell>
                <Table.Cell>
                  {req.createdAt?.seconds
                    ? new Date(req.createdAt.seconds * 1000).toLocaleString()
                    : "-"}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}

      <Drawer.Root
        open={isOpen}
        onOpenChange={(o: any) => !o && closeDrawer()}
        placement="bottom"
        closeOnOutsideClick
      >
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content borderTopRadius="2xl" maxH="60vh">
            <Drawer.CloseTrigger />
            <Drawer.Header textAlign="center" borderBottomWidth="1px">
              <Drawer.Title>Dettagli richiesta</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body overflowY="auto">
              {selected && (
                <Box textAlign="center" py={4}>
                  <Text fontWeight="bold" mb={2}>
                    {selected.email}
                  </Text>
                  <Image
                    src={selected.docUrl}
                    alt="Documento inviato"
                    maxH="300px"
                    objectFit="contain"
                    mx="auto"
                    mb={2}
                  />
                  <Link
                    href={selected.docUrl}
                    target="_blank"
                    color="blue.400"
                    fontSize="sm"
                  >
                    Apri in una nuova scheda
                  </Link>
                </Box>
              )}
            </Drawer.Body>
            <Drawer.Footer borderTopWidth="1px" alignContent="space-between">
              <Button
                variant="outline"
                colorScheme="red"
                onClick={handleReject}
                loading={processing}
              >
                Rifiuta
              </Button>
              <Button
                colorScheme="teal"
                onClick={handleApprove}
                loading={processing}
              >
                Approva
              </Button>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
    </Box>
  );
};
