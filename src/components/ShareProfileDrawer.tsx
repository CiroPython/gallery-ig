// src/components/ShareDrawer.tsx
import {
  Drawer,
  Button,
  chakra,
  VStack,
  IconButton,
  Text,
} from "@chakra-ui/react";
import {
  FaInstagram,
  FaFacebook,
  FaWhatsapp,
  FaTwitter,
  FaPaperPlane,
} from "react-icons/fa";
import { useState } from "react";

const InstagramIcon = chakra(FaInstagram as any);
const FacebookIcon = chakra(FaFacebook as any);
const WhatsappIcon = chakra(FaWhatsapp as any);
const TwitterIcon = chakra(FaTwitter as any);
const ShareIcon = chakra(FaPaperPlane as any);

interface ShareDrawerProps {
  postUrl: string;
}

export const ShareProfileDrawer = ({ postUrl }: ShareDrawerProps) => {
  const [open, setOpen] = useState(false);

  const shareOptions = [
    {
      label: "Instagram",
      icon: InstagramIcon,
      url: `https://www.instagram.com/?url=${encodeURIComponent(postUrl)}`,
    },
    {
      label: "Facebook",
      icon: FacebookIcon,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        postUrl
      )}`,
    },
    {
      label: "WhatsApp",
      icon: WhatsappIcon,
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(postUrl)}`,
    },
    {
      label: "Twitter",
      icon: TwitterIcon,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        postUrl
      )}`,
    },
  ];

  return (
    <Drawer.Root closeOnOutsideClick placement="bottom">
      <Drawer.Backdrop />
      <Drawer.Trigger asChild>
       
        <Button aria-label="Condividi" size="sm" variant="outline">
            Condividi profilo
          </Button>
      </Drawer.Trigger>

      <Drawer.Positioner>
        <Drawer.Content
          borderTopRadius="2xl"
          height="80vh"
          display="flex"
          flexDirection="column"
        >
          <Drawer.CloseTrigger />
          <Drawer.Header borderBottomWidth="1px" textAlign="center">
            <Drawer.Title>Condividi il tuo profilo</Drawer.Title>
          </Drawer.Header>

          <Drawer.Body flex="1" py={6}>
            <VStack gap={4}>
              {shareOptions.map((opt) => (
                <Button
                  key={opt.label}
                  width="100%"
                  onClick={() => {
                    window.open(opt.url, "_blank");
                    setOpen(false);
                  }}
                >
                  <opt.icon boxSize={5} />
                  {opt.label}
                </Button>
              ))}
            </VStack>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  );
};
