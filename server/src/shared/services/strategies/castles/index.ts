import type { Strategy } from "../types";
import { bonanzaGakoi } from "./bonanzaGakoi";
import { diamondMino } from "./diamondMino";
import { elmoGakoi } from "./elmoGakoi";
import { funaGakoi } from "./funaGakoi";
import { furibishaAnaguma } from "./furibishaAnaguma";
import { gangiGakoi } from "./gangiGakoi";
import { ginkanmuri } from "./ginkanmuri";
import { ginkanmuriAnaguma } from "./ginkanmuriAnaguma";
import { ginYagura } from "./ginYagura";
import { hidariMino } from "./hidariMino";
import { ibishaAnaguma } from "./ibishaAnaguma";
import { kaniGakoi } from "./kaniGakoi";
import { kataMino } from "./kataMino";
import { kataYagura } from "./kataYagura";
import { kimuraMino } from "./kimuraMino";
import { kinmuso } from "./kinmuso";
import { kinYagura } from "./kinYagura";
import { matsuoAnaguma } from "./matsuoAnaguma";
import { migigyoku } from "./migigyoku";
import { millennium } from "./millennium";
import { mino } from "./mino";
import { nakaharaGakoi } from "./nakaharaGakoi";
import { nakazumai } from "./nakazumai";
import { takaMino } from "./takaMino";
import { tenshukakuMino } from "./tenshukakuMino";

export { bonanzaGakoi } from "./bonanzaGakoi";
export { diamondMino } from "./diamondMino";
export { elmoGakoi } from "./elmoGakoi";
export { funaGakoi } from "./funaGakoi";
export { furibishaAnaguma } from "./furibishaAnaguma";
export { gangiGakoi } from "./gangiGakoi";
export { ginkanmuri } from "./ginkanmuri";
export { ginkanmuriAnaguma } from "./ginkanmuriAnaguma";
export { ginYagura } from "./ginYagura";
export { hidariMino } from "./hidariMino";
export { ibishaAnaguma } from "./ibishaAnaguma";
export { kaniGakoi } from "./kaniGakoi";
export { kataMino } from "./kataMino";
export { kataYagura } from "./kataYagura";
export { kimuraMino } from "./kimuraMino";
export { kinmuso } from "./kinmuso";
export { kinYagura } from "./kinYagura";
export { matsuoAnaguma } from "./matsuoAnaguma";
export { migigyoku } from "./migigyoku";
export { millennium } from "./millennium";
export { mino } from "./mino";
export { nakaharaGakoi } from "./nakaharaGakoi";
export { nakazumai } from "./nakazumai";
export { takaMino } from "./takaMino";
export { tenshukakuMino } from "./tenshukakuMino";

/**
 * すべての囲い
 */
export const castles: Strategy[] = [
  kinYagura,
  ginYagura,
  kataYagura,
  kaniGakoi,
  gangiGakoi,
  mino,
  kataMino,
  takaMino,
  ginkanmuri,
  diamondMino,
  kimuraMino,
  hidariMino,
  tenshukakuMino,
  funaGakoi,
  elmoGakoi,
  ibishaAnaguma,
  matsuoAnaguma,
  ginkanmuriAnaguma,
  furibishaAnaguma,
  kinmuso,
  millennium,
  nakazumai,
  nakaharaGakoi,
  bonanzaGakoi,
  migigyoku,
];
