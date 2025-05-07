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
import { FaUser } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";

import { AiOutlinePlusSquare, AiOutlineHeart } from "react-icons/ai";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { Button, CloseButton, Dialog, Portal } from "@chakra-ui/react";
// Wrappiamo le react-icons
const HomeIcon = chakra(BiHomeAlt as any);
const AddIcon = chakra(AiOutlinePlusSquare as any);
const HeartIcon = chakra(AiOutlineHeart as any);
const SearchIcon = chakra(BiSearch as any);
const CloseIcon = chakra(BiX as any);
const AvatarIcon = chakra(FaUser as any);
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
      <Box   
      onClick={()=> navigate("/")}>
      <Image
        src={logo}
        alt="Logo"
        boxSize={{ base: "46px", md: "50px" }}
        objectFit="contain"
        draggable={false}
     
      />
</Box>
      {/* --- Sezione ricerca --- */}
      {showFullNav ? (
        // desktop / tablet
        <Box mx="auto" maxW="300px" w="100%">
          <Input
            placeholder="Search"
            size="sm"
            variant="subtle"
            bg="gray.100"
            _placeholder={{ color: "gray.500" }}
          />
        </Box>
      ) : mobileSearch ? (
        // mobile: campo di ricerca aperto
        <Box flex="1" ml={2} position="relative">
          <Input
            placeholder="Search"
            size="sm"
            variant="subtle"
            bg="gray.100"
            _placeholder={{ color: "gray.500" }}
          />
          <IconButton
            aria-label="Chiudi ricerca"
            variant="ghost"
            size="sm"
            position="absolute"
            top="50%"
            right="4px"
            transform="translateY(-50%)"
            onClick={() => setMobileSearch(false)}
          >
            <CloseIcon boxSize={5} />
          </IconButton>
        </Box>
      ) : (
        // mobile: icona lente
        <IconButton
          aria-label="Search"
          variant="ghost"
          size="md"
          ml="auto"
          onClick={() => setMobileSearch(true)}
        >
          <SearchIcon boxSize={8} />
        </IconButton>
      )}

      {/* --- Icone di navigazione --- */}
      <HStack gap={{ base: 1, md: 2 }} ml={{ base: 0, md: 4 }}>
        {profile?.permissions === "admin" ? (
          <IconButton
            onClick={() => navigate("/createpost")}
            aria-label="Add"
            variant="ghost"
            size="md"
          >
            <AddIcon boxSize={8} />
          </IconButton>
        ) : null}
        {showFullNav && (
          <>
               {profile?.uid ? 
            <IconButton aria-label="Likes" variant="ghost" size="md">
              <HeartIcon boxSize={8} />
            </IconButton> : null}
          </>
        )}
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
          <IconButton
            onClick={() => setTryLogout(true)}
            aria-label="User"
            variant="ghost"
            size="md"
          >
            <LogoutIcon boxSize={7} />
          </IconButton>
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
