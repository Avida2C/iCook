/**
 * Central icon registry.
 *
 * Every icon used across the app is imported here from `react-icons` and
 * re-exported with an app-friendly name. Components should import icons from
 * this file only — never pull from `react-icons` directly — so the icon set
 * stays consistent and swappable in one place.
 *
 * All icons are `IconType` components: they accept `className` (for Tailwind
 * sizing/colour), `size`, `title`, `aria-hidden`, etc., and render with
 * `currentColor`.
 */
import {
  FiSearch,
  FiBell,
  FiSettings,
  FiHome,
  FiCompass,
  FiPlusSquare,
  FiGrid,
  FiUser,
  FiUserPlus,
  FiHeart,
  FiShare2,
  FiSend,
  FiArrowLeft,
  FiBookmark,
  FiEdit2,
  FiX,
  FiUploadCloud,
  FiImage,
  FiMic,
  FiClock,
  FiChevronRight,
  FiChevronUp,
  FiChevronDown,
  FiPlus,
  FiShield,
  FiKey,
  FiSmartphone,
  FiMail,
  FiCopy,
  FiRefreshCw,
  FiCheck,
  FiTrash2,
  FiSun,
  FiMoon,
  FiFilter,
  FiEye,
  FiEyeOff,
  FiSmile,
  FiFlag,
} from "react-icons/fi";
import {
  FaPlay,
  FaHeart,
  FaBookmark,
  FaUtensils,
  FaCheckCircle,
  FaMinusCircle,
  FaBold,
  FaItalic,
  FaUnderline,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaLink,
} from "react-icons/fa";
import { BiCommentDots, BiCommentEdit } from "react-icons/bi";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa6";
import { LuCookingPot, LuChefHat, LuEggFried, LuMessageSquareText, LuNotepadText } from "react-icons/lu";



// App bar
export const SearchIcon = FiSearch;
export const BellIcon = FiBell;
export const GearIcon = FiSettings;

// Theme
export const SunIcon = FiSun;
export const MoonIcon = FiMoon;

// Bottom navigation
export const RecipesIcon = FiHome;
export const DiscoverIcon = FiCompass;
export const CreateIcon = FiPlusSquare;
export const HubIcon = FiGrid;
export const UserIcon = FiUser;

// Social / actions
export const HeartIcon = FiHeart;
export const HeartFillIcon = FaHeart;
export const ShareIcon = FiShare2;
export const MessageIcon = LuMessageSquareText;
export const PostIcon = LuNotepadText;
export const SendIcon = FiSend;
export const UserAddIcon = FiUserPlus;

// Navigation / chrome
export const BackIcon = FiArrowLeft;
export const CloseIcon = FiX;
export const ChevronRightIcon = FiChevronRight;
export const ChevronUpIcon = FiChevronUp;
export const ChevronDownIcon = FiChevronDown;
export const PlusIcon = FiPlus;
export const FilterIcon = FiFilter;

// Security / login
export const ShieldIcon = FiShield;
export const KeyIcon = FiKey;
export const SmartphoneIcon = FiSmartphone;
export const MailIcon = FiMail;
export const EyeIcon = FiEye;
export const EyeOffIcon = FiEyeOff;
export const CopyIcon = FiCopy;
export const RefreshIcon = FiRefreshCw;
export const CheckIcon = FiCheck;
export const TrashIcon = FiTrash2;

// Content
export const BookmarkIcon = FiBookmark;
export const BookmarkFillIcon = FaBookmark;
export const EditIcon = FiEdit2;
export const MinusCircleIcon = FaMinusCircle;
export const UploadIcon = FiUploadCloud;
export const ImageIcon = FiImage;
export const MicIcon = FiMic;
export const ClockIcon = FiClock;
export const ServingIcon = FaUtensils;
export const PlayIcon = FaPlay;
export const ApproveIcon = FaCheckCircle;
export const CommentIcon = BiCommentDots;
export const CommentEditIcon = BiCommentEdit;
export const EmojiIcon = FiSmile;
export const FlagIcon = FiFlag;

// Post editor toolbar
export const BoldIcon = FaBold;
export const ItalicIcon = FaItalic;
export const UnderlineIcon = FaUnderline;
export const AlignLeftIcon = FaAlignLeft;
export const AlignCenterIcon = FaAlignCenter;
export const AlignRightIcon = FaAlignRight;
export const LinkIcon = FaLink;

// Brand / social login
export const GoogleIcon = FcGoogle;
export const FacebookIcon = FaFacebook;

// Getting Started Page
export const ChefHat = LuChefHat;
export const CookingPot = LuCookingPot;
export const EggFried = LuEggFried;
