"use client";
/**
 * KONEKSYON PAM — Système d'icônes unifié.
 *
 * UNE seule source de vérité pour toutes les icônes du site.
 * - Bibliothèque unique : Lucide (trait uniforme, style premium SaaS).
 * - Taille, épaisseur de trait et alignement standardisés.
 * - Couleur héritée (`currentColor`) → suit la palette du contexte.
 *
 * Usage :  <Icon name="bible" />              (taille par défaut 20)
 *          <Icon name="don" size={28} />
 *          <Icon name="trophy" className="text-amber-500" />
 *
 * Pour ajouter un concept : ajoute une entrée dans ICON_MAP (et rien d'autre).
 * N'importe JAMAIS une icône Lucide directement dans une page — passe par <Icon>.
 */
import {
  House, Compass, GraduationCap, BookOpen, Trophy, Users, Globe, Landmark,
  Calendar, HeartHandshake, UserCircle, Book, BookMarked, PlayCircle, Brain,
  BadgeCheck, Award, Medal, Bell, Settings, HandHeart, Music, Music2, Quote,
  ScrollText, Presentation, BarChart3, TrendingUp, Star, Heart, Download,
  Share2, Search, Plus, Check, CheckCircle, X, ArrowRight, ArrowLeft, Flame,
  Target, Zap, Lightbulb, Lock, Mail, Phone, MapPin, Clock, Timer, User,
  Church, Cross, Sprout, Key, Shield, Rocket, Sparkles, Flag, HandCoins,
  ClipboardCheck, MessageSquare, MessageSquareQuote, Feather, Handshake,
  Gift, Crown, Info, AlertTriangle, ChevronRight, ChevronLeft, Menu, LogOut,
  Eye, Edit, Trash2, Send, Link2, Wallet, CreditCard, Building2, Sun, Moon,
  Wifi, Video, Image as ImageIcon, FileText, Folder, Bookmark, ThumbsUp,
  Coffee, Wind, Anchor, Sword, Scale, Baby, Users2, Volume2, VolumeX, Mic,
  Circle, Play, Pause, RefreshCw,
  type LucideIcon,
} from "lucide-react";

// Mapping sémantique : concept KONEKSYON PAM → icône Lucide.
const ICON_MAP = {
  // ── Navigation principale ──
  home: House,
  accueil: House,
  mission: Compass,
  academie: GraduationCap,
  bible: BookOpen,
  championnats: Trophy,
  communaute: Users,
  impact: Globe,
  fondation: Landmark,
  evenements: Calendar,
  don: HeartHandshake,
  compte: UserCircle,
  profil: UserCircle,

  // ── Académie / formation ──
  cours: BookMarked,
  lecon: BookOpen,
  etude: BookOpen,
  enseignement: Presentation,
  video: PlayCircle,
  quiz: Brain,
  exercice: ClipboardCheck,
  certificat: BadgeCheck,
  badge: Award,
  medaille: Medal,
  progression: TrendingUp,
  module: Folder,
  pdf: FileText,
  telechargement: Download,

  // ── Foi / contenu spirituel ──
  priere: HandHeart,
  louange: Music,
  chants: Music2,
  musique: Music,
  psaumes: ScrollText,
  temoignages: MessageSquareQuote,
  verset: Quote,
  eglise: Church,
  croix: Cross,
  colombe: Feather,
  foi: Sprout,
  esperance: Anchor,

  // ── Championnats / jeu ──
  trophee: Trophy,
  classement: BarChart3,
  chrono: Timer,
  score: Target,
  defi: Zap,
  couronne: Crown,
  epee: Sword,

  // ── Communauté / social ──
  utilisateur: User,
  utilisateurs: Users,
  groupe: Users2,
  message: MessageSquare,
  partage: Share2,
  jaime: ThumbsUp,
  cadeau: Gift,
  poignee_main: Handshake,

  // ── Fondation / humanitaire ──
  batiment: Building2,
  monde: Globe,
  cible: Target,
  balance: Scale,
  enfant: Baby,
  bouclier: Shield,

  // ── Dons / paiement ──
  coeur: Heart,
  main_coeur: HandHeart,
  main_pieces: HandCoins,
  portefeuille: Wallet,
  carte: CreditCard,

  // ── UI / actions ──
  notifications: Bell,
  parametres: Settings,
  recherche: Search,
  ajouter: Plus,
  valider: Check,
  succes: CheckCircle,
  fermer: X,
  fleche_droite: ArrowRight,
  fleche_gauche: ArrowLeft,
  chevron_droite: ChevronRight,
  chevron_gauche: ChevronLeft,
  menu: Menu,
  deconnexion: LogOut,
  voir: Eye,
  editer: Edit,
  supprimer: Trash2,
  envoyer: Send,
  lien: Link2,
  favori: Star,
  signet: Bookmark,
  email: Mail,
  telephone: Phone,
  localisation: MapPin,
  horloge: Clock,
  info: Info,
  alerte: AlertTriangle,
  cadenas: Lock,
  cle: Key,

  // ── Accents / décoratif ──
  feu: Flame,
  etoile: Star,
  eclair: Zap,
  idee: Lightbulb,
  fusee: Rocket,
  etincelles: Sparkles,
  drapeau: Flag,
  soleil: Sun,
  lune: Moon,
  wifi: Wifi,
  cafe: Coffee,
  vent: Wind,
  image: ImageIcon,
  audio: Volume2,
  muet: VolumeX,
  micro: Mic,
  pastille: Circle,
  lecture: Play,
  pause: Pause,
  rafraichir: RefreshCw,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICON_MAP;

export interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
}

export default function Icon({
  name,
  size = 20,
  strokeWidth = 2,
  className,
  color,
  style,
  "aria-label": ariaLabel,
}: IconProps) {
  const Cmp = ICON_MAP[name];
  if (!Cmp) return null;
  return (
    <Cmp
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      color={color}
      style={style}
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      focusable="false"
    />
  );
}
