"use client";

import { useState, useCallback } from "react";

type CommandPaletteState = {
  open: boolean;
  setOpen: (v: boolean) => void;
  openPalette: () => void;
};

let state: CommandPaletteState = { open: false, setOpen: () => {}, openPalette: () => {} };

export function useCommandPalette() {
  return state;
}

export function _setCommandPaletteState(s: CommandPaletteState) {
  state = s;
}
