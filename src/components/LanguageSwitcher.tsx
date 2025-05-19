"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "en", label: "English", emoji: "🇬🇧" },
  { code: "it", label: "Italiano", emoji: "🇮🇹" },
  { code: "es", label: "Español", emoji: "🇪🇸" },
];

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [currentCode, setCurrentCode] = useState(i18n.language);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Sync if i18n.language changes externally
  useEffect(() => {
    setCurrentCode(i18n.language);
  }, [i18n.language]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = languages.find((l) => l.code === currentCode) ?? languages[0];

  const handleSelect = (code: string) => {
    i18n.changeLanguage(code);
    setCurrentCode(code);
    setOpen(false);
  };

  return (
    <Box ref={ref} position="relative" display="inline-block">
      {/* Trigger: solo bandierina */}
      <Box
        as="button"
        onClick={() => setOpen((o) => !o)}
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        w="8"
        h="8"
        borderRadius="full"
        bg="gray.200"
        fontSize="20px"
        _hover={{ bg: "gray.300" }}
      >
        {current.emoji}
      </Box>

      {/* Dropdown menu */}
      {open && (
        <Box
          position="absolute"
          top="calc(100% + 4px)"
          right={0}
          bg="white"
          boxShadow="lg"
          borderRadius="md"
          minW="140px"
          zIndex="popover"
        >
          {languages.map((lang) => (
            <Box
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              px={3}
              py={2}
              display="flex"
              alignItems="center"
              cursor="pointer"
              _hover={{ bg: "gray.100" }}
            >
              <Box
                as="span"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                w="6"
                h="6"
                borderRadius="full"
                fontSize="18px"
                mr={2}
              >
                {lang.emoji}
              </Box>
              {lang.label}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};
