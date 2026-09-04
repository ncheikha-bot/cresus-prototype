import React from 'react';
import type { Icon as IconePhosphor, IconProps } from '@phosphor-icons/react';
import {
  Scales as PhScales,
  ArrowsLeftRight as PhArrowsLeftRight,
  LinkSimple as PhLinkSimple,
  Printer as PhPrinter,
  FilmSlate as PhFilmSlate,
  Laptop as PhLaptop,
  ShoppingCart as PhShoppingCart,
  Microphone as PhMicrophone,
  Wrench as PhWrench,
  BookmarkSimple as PhBookmarkSimple,
  Globe as PhGlobe,
  BookOpen as PhBookOpen,
  Note as PhNote,
  Monitor as PhMonitor,
  Archive as PhArchive,
  ArrowDownRight as PhArrowDownRight,
  ArrowSquareOut as PhArrowSquareOut,
  CaretLeft as PhCaretLeft,
  Checks as PhChecks,
  CircleNotch as PhCircleNotch,
  DotsThreeVertical as PhDotsThreeVertical,
  FileDashed as PhFileDashed,
  FilePlus as PhFilePlus,
  FileX as PhFileX,
  FloppyDisk as PhFloppyDisk,
  Megaphone as PhMegaphone,
  Money as PhMoney,
  Percent as PhPercent,
  Pulse as PhPulse,
  ShieldWarning as PhShieldWarning,
  SortAscending as PhSortAscending,
  Tag as PhTag,
  Target as PhTarget,
  UserCheck as PhUserCheck,
  IdentificationCard as PhIdentificationCard,
  Storefront as PhStorefront,
  HardHat as PhHardHat,
  Boat as PhBoat,
  Certificate as PhCertificate,
  SunHorizon as PhSunHorizon,
  ArrowCounterClockwise as PhArrowCounterClockwise,
  ArrowLeft as PhArrowLeft,
  ArrowRight as PhArrowRight,
  ArrowUpRight as PhArrowUpRight,
  ArrowsClockwise as PhArrowsClockwise,
  At as PhAt,
  Bank as PhBank,
  Bell as PhBell,
  BellRinging as PhBellRinging,
  BellSlash as PhBellSlash,
  Briefcase as PhBriefcase,
  Buildings as PhBuildings,
  Calculator as PhCalculator,
  Calendar as PhCalendar,
  CalendarBlank as PhCalendarBlank,
  CalendarCheck as PhCalendarCheck,
  Camera as PhCamera,
  CaretDown as PhCaretDown,
  CaretRight as PhCaretRight,
  CaretUp as PhCaretUp,
  ChartBar as PhChartBar,
  ChartPie as PhChartPie,
  ChatCircle as PhChatCircle,
  ChatText as PhChatText,
  Check as PhCheck,
  CheckCircle as PhCheckCircle,
  Circle as PhCircle,
  ClipboardText as PhClipboardText,
  Clock as PhClock,
  ClockCounterClockwise as PhClockCounterClockwise,
  CreditCard as PhCreditCard,
  Crown as PhCrown,
  CurrencyDollar as PhCurrencyDollar,
  DeviceMobile as PhDeviceMobile,
  DownloadSimple as PhDownloadSimple,
  Envelope as PhEnvelope,
  Eye as PhEye,
  EyeSlash as PhEyeSlash,
  File as PhFile,
  FileText as PhFileText,
  Files as PhFiles,
  Fingerprint as PhFingerprint,
  FolderOpen as PhFolderOpen,
  FolderSimple as PhFolderSimple,
  Funnel as PhFunnel,
  Gear as PhGear,
  Hash as PhHash,
  House as PhHouse,
  Image as PhImage,
  Info as PhInfo,
  Lightning as PhLightning,
  List as PhList,
  Lock as PhLock,
  MagnifyingGlass as PhMagnifyingGlass,
  MapPin as PhMapPin,
  Medal as PhMedal,
  Moon as PhMoon,
  Package as PhPackage,
  PaintBrush as PhPaintBrush,
  Palette as PhPalette,
  PaperPlaneTilt as PhPaperPlaneTilt,
  Paperclip as PhPaperclip,
  Pause as PhPause,
  PenNib as PhPenNib,
  PencilSimple as PhPencilSimple,
  PencilSimpleLine as PhPencilSimpleLine,
  Phone as PhPhone,
  Play as PhPlay,
  Plus as PhPlus,
  Prohibit as PhProhibit,
  Question as PhQuestion,
  Receipt as PhReceipt,
  Rocket as PhRocket,
  Scan as PhScan,
  SealCheck as PhSealCheck,
  Shield as PhShield,
  ShieldCheck as PhShieldCheck,
  SignOut as PhSignOut,
  Signature as PhSignature,
  Sliders as PhSliders,
  Sparkle as PhSparkle,
  SquaresFour as PhSquaresFour,
  Stack as PhStack,
  Star as PhStar,
  Sun as PhSun,
  ThumbsDown as PhThumbsDown,
  ThumbsUp as PhThumbsUp,
  Timer as PhTimer,
  Trash as PhTrash,
  TrendDown as PhTrendDown,
  TrendUp as PhTrendUp,
  UploadSimple as PhUploadSimple,
  User as PhUser,
  UserCircle as PhUserCircle,
  UserPlus as PhUserPlus,
  Users as PhUsers,
  VideoCamera as PhVideoCamera,
  Wallet as PhWallet,
  Warning as PhWarning,
  WarningCircle as PhWarningCircle,
  WifiHigh as PhWifiHigh,
  X as PhX,
  XCircle as PhXCircle,
} from '@phosphor-icons/react';

/**
 * Jeu d'icônes des espaces client.
 *
 * Les écrans utilisaient les icônes par défaut de `lucide-react`, au trait épais
 * et au dessin très répandu : on les retrouve à l'identique dans quantité
 * d'interfaces, ce qui donnait au produit un air de gabarit. Celles-ci viennent
 * de Phosphor, dessinées ici en graisse « light » — trait fin, angles adoucis,
 * silhouettes plus calmes.
 *
 * Le module réexporte les *mêmes noms* que ceux employés jusqu'ici : les écrans
 * n'ont eu qu'à changer la provenance de leur import, sans toucher au JSX.
 */
export type { IconProps };
export type IconeCresus = IconePhosphor;

/** Fixe la graisse commune, tout en laissant chaque écran la surcharger. */
const affiner = (Base: IconePhosphor, nom: string): IconePhosphor => {
  const Affinee = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
    <Base ref={ref} weight="light" {...props} />
  ));
  Affinee.displayName = nom;
  return Affinee as unknown as IconePhosphor;
};

export const AlertCircle = affiner(PhWarningCircle, 'AlertCircle');
export const AlertTriangle = affiner(PhWarning, 'AlertTriangle');
export const ArrowLeft = affiner(PhArrowLeft, 'ArrowLeft');
export const ArrowRight = affiner(PhArrowRight, 'ArrowRight');
export const ArrowUpRight = affiner(PhArrowUpRight, 'ArrowUpRight');
export const AtSign = affiner(PhAt, 'AtSign');
export const Award = affiner(PhMedal, 'Award');
export const BadgeCheck = affiner(PhSealCheck, 'BadgeCheck');
export const Ban = affiner(PhProhibit, 'Ban');
export const BarChart3 = affiner(PhChartBar, 'BarChart3');
export const Bell = affiner(PhBell, 'Bell');
export const BellDot = affiner(PhBellRinging, 'BellDot');
export const BellOff = affiner(PhBellSlash, 'BellOff');
export const BellRing = affiner(PhBellRinging, 'BellRing');
export const Briefcase = affiner(PhBriefcase, 'Briefcase');
export const Brush = affiner(PhPaintBrush, 'Brush');
export const Building = affiner(PhBuildings, 'Building');
export const Building2 = affiner(PhBuildings, 'Building2');
export const Calculator = affiner(PhCalculator, 'Calculator');
export const Calendar = affiner(PhCalendar, 'Calendar');
export const CalendarCheck = affiner(PhCalendarCheck, 'CalendarCheck');
export const CalendarDays = affiner(PhCalendarBlank, 'CalendarDays');
export const Camera = affiner(PhCamera, 'Camera');
export const Check = affiner(PhCheck, 'Check');
export const CheckCircle = affiner(PhCheckCircle, 'CheckCircle');
export const CheckCircle2 = affiner(PhCheckCircle, 'CheckCircle2');
export const ChevronDown = affiner(PhCaretDown, 'ChevronDown');
export const ChevronRight = affiner(PhCaretRight, 'ChevronRight');
export const ChevronUp = affiner(PhCaretUp, 'ChevronUp');
export const Circle = affiner(PhCircle, 'Circle');
export const CircleCheck = affiner(PhCheckCircle, 'CircleCheck');
export const CircleDot = affiner(PhCircle, 'CircleDot');
export const CircleHelp = affiner(PhQuestion, 'CircleHelp');
export const CircleX = affiner(PhXCircle, 'CircleX');
export const ClipboardList = affiner(PhClipboardText, 'ClipboardList');
export const Clock = affiner(PhClock, 'Clock');
export const CreditCard = affiner(PhCreditCard, 'CreditCard');
export const Crown = affiner(PhCrown, 'Crown');
export const DollarSign = affiner(PhCurrencyDollar, 'DollarSign');
export const Download = affiner(PhDownloadSimple, 'Download');
export const Edit = affiner(PhPencilSimple, 'Edit');
export const Edit2 = affiner(PhPencilSimple, 'Edit2');
export const Edit3 = affiner(PhPencilSimpleLine, 'Edit3');
export const Eye = affiner(PhEye, 'Eye');
export const EyeOff = affiner(PhEyeSlash, 'EyeOff');
export const File = affiner(PhFile, 'File');
export const FileCheck = affiner(PhFileText, 'FileCheck');
export const FileSignature = affiner(PhSignature, 'FileSignature');
export const FileStack = affiner(PhFiles, 'FileStack');
export const FileText = affiner(PhFileText, 'FileText');
export const Filter = affiner(PhFunnel, 'Filter');
export const Fingerprint = affiner(PhFingerprint, 'Fingerprint');
export const Folder = affiner(PhFolderSimple, 'Folder');
export const FolderClock = affiner(PhFolderSimple, 'FolderClock');
export const FolderKanban = affiner(PhFolderSimple, 'FolderKanban');
export const FolderOpen = affiner(PhFolderOpen, 'FolderOpen');
export const Grid3x3 = affiner(PhSquaresFour, 'Grid3x3');
export const Hash = affiner(PhHash, 'Hash');
export const HelpCircle = affiner(PhQuestion, 'HelpCircle');
export const History = affiner(PhClockCounterClockwise, 'History');
export const Home = affiner(PhHouse, 'Home');
export const Image = affiner(PhImage, 'Image');
export const Info = affiner(PhInfo, 'Info');
export const Landmark = affiner(PhBank, 'Landmark');
export const Layers = affiner(PhStack, 'Layers');
export const Layers3 = affiner(PhStack, 'Layers3');
export const LayoutGrid = affiner(PhSquaresFour, 'LayoutGrid');
export const List = affiner(PhList, 'List');
export const Lock = affiner(PhLock, 'Lock');
export const LogOut = affiner(PhSignOut, 'LogOut');
export const Mail = affiner(PhEnvelope, 'Mail');
export const MapPin = affiner(PhMapPin, 'MapPin');
export const Menu = affiner(PhList, 'Menu');
export const MessageCircle = affiner(PhChatCircle, 'MessageCircle');
export const MessageSquare = affiner(PhChatText, 'MessageSquare');
export const Moon = affiner(PhMoon, 'Moon');
export const Package = affiner(PhPackage, 'Package');
export const Palette = affiner(PhPalette, 'Palette');
export const Paperclip = affiner(PhPaperclip, 'Paperclip');
export const Pause = affiner(PhPause, 'Pause');
export const Pen = affiner(PhPencilSimple, 'Pen');
export const PenLine = affiner(PhPencilSimpleLine, 'PenLine');
export const PenTool = affiner(PhPenNib, 'PenTool');
export const Phone = affiner(PhPhone, 'Phone');
export const PieChart = affiner(PhChartPie, 'PieChart');
export const Play = affiner(PhPlay, 'Play');
export const Plus = affiner(PhPlus, 'Plus');
export const Receipt = affiner(PhReceipt, 'Receipt');
export const RefreshCw = affiner(PhArrowsClockwise, 'RefreshCw');
export const Rocket = affiner(PhRocket, 'Rocket');
export const RotateCcw = affiner(PhArrowCounterClockwise, 'RotateCcw');
export const ScanFace = affiner(PhScan, 'ScanFace');
export const Search = affiner(PhMagnifyingGlass, 'Search');
export const Send = affiner(PhPaperPlaneTilt, 'Send');
export const Settings = affiner(PhGear, 'Settings');
export const Settings2 = affiner(PhSliders, 'Settings2');
export const Shield = affiner(PhShield, 'Shield');
export const ShieldCheck = affiner(PhShieldCheck, 'ShieldCheck');
export const Smartphone = affiner(PhDeviceMobile, 'Smartphone');
export const Sparkles = affiner(PhSparkle, 'Sparkles');
export const Star = affiner(PhStar, 'Star');
export const Sun = affiner(PhSun, 'Sun');
export const ThumbsDown = affiner(PhThumbsDown, 'ThumbsDown');
export const ThumbsUp = affiner(PhThumbsUp, 'ThumbsUp');
export const Timer = affiner(PhTimer, 'Timer');
export const Trash2 = affiner(PhTrash, 'Trash2');
export const TrendingDown = affiner(PhTrendDown, 'TrendingDown');
export const TrendingUp = affiner(PhTrendUp, 'TrendingUp');
export const TriangleAlert = affiner(PhWarning, 'TriangleAlert');
export const Upload = affiner(PhUploadSimple, 'Upload');
export const User = affiner(PhUser, 'User');
export const UserCircle = affiner(PhUserCircle, 'UserCircle');
export const UserCircle2 = affiner(PhUserCircle, 'UserCircle2');
export const UserPlus = affiner(PhUserPlus, 'UserPlus');
export const Users = affiner(PhUsers, 'Users');
export const Video = affiner(PhVideoCamera, 'Video');
export const Wallet = affiner(PhWallet, 'Wallet');
export const Wifi = affiner(PhWifiHigh, 'Wifi');
export const X = affiner(PhX, 'X');
export const XCircle = affiner(PhXCircle, 'XCircle');
export const Zap = affiner(PhLightning, 'Zap');

/* Symboles employés là où le produit affichait des emojis. */
export const Buildings = Building2;
export const Bank = Landmark;
export const House = Home;
export const IdentificationCard = affiner(PhIdentificationCard, 'IdentificationCard');
export const Storefront = affiner(PhStorefront, 'Storefront');
export const HardHat = affiner(PhHardHat, 'HardHat');
export const Boat = affiner(PhBoat, 'Boat');
export const Certificate = affiner(PhCertificate, 'Certificate');
export const SunHorizon = affiner(PhSunHorizon, 'SunHorizon');

/** Paiement mobile : le nom Phosphor, employé tel quel par les tunnels. */
export const DeviceMobile = Smartphone;

/* Catalogues (branding, modifications). */
export const Scales = affiner(PhScales, 'Scales');
export const ArrowsLeftRight = affiner(PhArrowsLeftRight, 'ArrowsLeftRight');
export const LinkSimple = affiner(PhLinkSimple, 'LinkSimple');
export const Printer = affiner(PhPrinter, 'Printer');
export const FilmSlate = affiner(PhFilmSlate, 'FilmSlate');
export const Laptop = affiner(PhLaptop, 'Laptop');
export const ShoppingCart = affiner(PhShoppingCart, 'ShoppingCart');
export const Microphone = affiner(PhMicrophone, 'Microphone');
export const Wrench = affiner(PhWrench, 'Wrench');
export const BookmarkSimple = affiner(PhBookmarkSimple, 'BookmarkSimple');
export const Globe = affiner(PhGlobe, 'Globe');
export const BookOpen = affiner(PhBookOpen, 'BookOpen');
export const Note = affiner(PhNote, 'Note');

/* Écrans partagés (accueil, onboarding, livrables). */
export const ClipboardCheck = ClipboardList;
export const Monitor = affiner(PhMonitor, 'Monitor');

/* Écrans d'administration et de comptabilité. */
export const Activity = affiner(PhPulse, 'Activity');
export const Archive = affiner(PhArchive, 'Archive');
export const ArrowDownRight = affiner(PhArrowDownRight, 'ArrowDownRight');
export const Banknote = affiner(PhMoney, 'Banknote');
export const CheckCheck = affiner(PhChecks, 'CheckCheck');
export const ChevronLeft = affiner(PhCaretLeft, 'ChevronLeft');
export const ExternalLink = affiner(PhArrowSquareOut, 'ExternalLink');
export const FileClock = affiner(PhFileDashed, 'FileClock');
export const FilePlus = affiner(PhFilePlus, 'FilePlus');
export const FileX = affiner(PhFileX, 'FileX');
export const LayoutDashboard = affiner(PhSquaresFour, 'LayoutDashboard');
export const Loader = affiner(PhCircleNotch, 'Loader');
export const Loader2 = affiner(PhCircleNotch, 'Loader2');
export const Megaphone = affiner(PhMegaphone, 'Megaphone');
export const MoreVertical = affiner(PhDotsThreeVertical, 'MoreVertical');
export const Percent = affiner(PhPercent, 'Percent');
export const Save = affiner(PhFloppyDisk, 'Save');
export const ShieldQuestion = affiner(PhShieldWarning, 'ShieldQuestion');
export const SortAsc = affiner(PhSortAscending, 'SortAsc');
export const Tag = affiner(PhTag, 'Tag');
export const Target = affiner(PhTarget, 'Target');
export const UserCheck = affiner(PhUserCheck, 'UserCheck');

/** Alias historique : certains écrans importaient `Image as ImageIcon`. */
export const ImageIcon = Image;
