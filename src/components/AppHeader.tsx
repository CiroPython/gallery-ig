// src/components/AppHeader.tsx
import React, { useState } from "react";
import {
  Flex,
  Box,
  Input,
  IconButton,
  HStack,
  chakra,
  Image,
  useBreakpointValue,
} from "@chakra-ui/react";
import { BiHomeAlt, BiSearch, BiX } from "react-icons/bi";
import { FaBookmark, FaRegBookmark, FaUser } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { FaUserCog } from "react-icons/fa";

import { AiOutlinePlusSquare, AiOutlineHeart } from "react-icons/ai";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { Button, CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { FaRegCircleUser, FaRegRectangleList } from "react-icons/fa6";
// Wrappiamo le react-icons
const HomeIcon = chakra(BiHomeAlt as any);
const AddIcon = chakra(AiOutlinePlusSquare as any);
const ListIcon = chakra(FaRegRectangleList as any);

const HeartIcon = chakra(FaRegBookmark as any);
const SearchIcon = chakra(BiSearch as any);
const CloseIcon = chakra(BiX as any);
const AvatarIcon = chakra(FaUser as any);
const EditIcon = chakra(FaRegCircleUser as any);
const LogoutIcon = chakra(FiLogOut as any);
export const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  // breakpoint: md+ mostra nav completa
  const showFullNav = useBreakpointValue({ base: false, md: true });
  // stato per ricerca mobile
  const [mobileSearch, setMobileSearch] = useState(false);
  const { user, profile, logout } = useUser();

  const [tryLogout, setTryLogout] = useState(false);
  return (
    <Flex
      as="header"
      position="fixed"
      top="0"
      left="0"
      right="0"
      pt={{ base: "env(safe-area-inset-top)", md: 2 }}
      px={{ base: 2, md: 4 }}
      py={2}
      align="center"
      bg="white"
      boxShadow="sm"
      zIndex="100"
    >
      {/* Logo */}
      <Box onClick={() => navigate("/")}>
        <Image
          src={logo}
          alt="Logo"
          boxSize={{ base: "46px", md: "50px" }}
          objectFit="contain"
          draggable={false}
        />
      </Box>

      {/* --- Icone di navigazione --- */}
      <HStack gap={{ base: 0, md: 2 }} ml="auto">
        {profile?.permissions === "admin" ? (
          <IconButton
            onClick={() => navigate("/admin/requests")}
            aria-label="Add"
            variant="ghost"
            size="md"
          >
            <ListIcon boxSize={6} />
          </IconButton>
        ) : null}
        {profile?.permissions === "admin" || profile?.verified === true ? (
          <IconButton
            onClick={() => navigate("/createpost")}
            aria-label="Add"
            variant="ghost"
            size="md"
          >
            <AddIcon boxSize={6} />
          </IconButton>
        ) : null}
        <>
          {profile?.uid ? (
            <IconButton
              onClick={() => navigate("/saved")}
              aria-label="Likes"
              variant="ghost"
              size="md"
            >
              <HeartIcon boxSize={5} />
            </IconButton>
          ) : null}
        </>

        {tryLogout ? (
          <Dialog.Root
            lazyMount
            open={tryLogout}
            onOpenChange={(e: {
              open: boolean | ((prevState: boolean) => boolean);
            }) => setTryLogout(e.open)}
          >
            <Portal>
              <Dialog.Backdrop />
              <Dialog.Positioner>
                <Dialog.Content>
                  <Dialog.Header>
                    <Dialog.Title>Disconnessione</Dialog.Title>
                  </Dialog.Header>
                  <Dialog.Body>Sei sicuro che vuoi uscire?</Dialog.Body>
                  <Dialog.Footer>
                    <Dialog.ActionTrigger asChild>
                      <Button variant="outline">Annulla</Button>
                    </Dialog.ActionTrigger>
                    <Button
                      onClick={() => {
                        logout();
                        setTryLogout(false);
                      }}
                    >
                      Esci
                    </Button>
                  </Dialog.Footer>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" />
                  </Dialog.CloseTrigger>
                </Dialog.Content>
              </Dialog.Positioner>
            </Portal>
          </Dialog.Root>
        ) : null}
        {/* Avatar profilo */}
        {user ? (
          <>
            <IconButton
              onClick={() => navigate("/profile")}
              aria-label="User"
              variant="ghost"
              size="md"
            >
              <EditIcon boxSize={5} />
            </IconButton>
            <IconButton
              onClick={() => setTryLogout(true)}
              aria-label="User"
              variant="ghost"
              size="md"
            >
              <LogoutIcon boxSize={6} />
            </IconButton>
          </>
        ) : (
          <IconButton
            onClick={() => navigate("/login")}
            aria-label="User"
            variant="ghost"
            size="md"
          >
            <AvatarIcon />
          </IconButton>
        )}
      </HStack>
    </Flex>
  );
};
