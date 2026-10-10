import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useEffect, lazy, Suspense } from "react";
import { Crown } from "lucide-react";
import MobileTabBar from "@/components/MobileTabBar";
import HelpWidget from "@/components/HelpWidget";
import GlobalSearch from "@/components/GlobalSearch";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import AudioPlayerBar from "@/components/AudioPlayer/AudioPlayerBar";

// Main pages
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const UploadMusic = lazy(() => import("./pages/dashboard/UploadMusic"));
const MyVault = lazy(() => import("./pages/dashboard/MyVault"));
const Earnings = lazy(() => import("./pages/dashboard/Earnings"));
const QRGenerator = lazy(() => import("./pages/dashboard/QRGenerator"));
const BuildPoints = lazy(() => import("./pages/dashboard/BuildPoints"));
const Credits = lazy(() => import("./pages/dashboard/Credits"));
const AdminOps = lazy(() => import("./pages/dashboard/AdminOps"));
const StudioManager = lazy(() => import("./pages/dashboard/StudioManager"));
const Producer = lazy(() => import("./pages/dashboard/Producer"));
const Cleaner = lazy(() => import("./pages/dashboard/Cleaner"));
const Client = lazy(() => import("./pages/dashboard/Client"));
const Book = lazy(() => import("./pages/Book"));
const Profile = lazy(() => import("./pages/Profile"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Info = lazy(() => import("./pages/Info"));
const Shop = lazy(() => import("./pages/Shop"));
const ShopDigitalVinyl = lazy(() => import("./pages/shop/DigitalVinyl"));
const ShopUSBBundles = lazy(() => import("./pages/shop/USBBundles"));
const ShopNFTs = lazy(() => import("./pages/shop/NFTs"));
const ShopExclusive = lazy(() => import("./pages/shop/Exclusive"));
const ShopClothing = lazy(() => import("./pages/shop/Clothing"));
const ShopCheckout = lazy(() => import("./pages/shop/Checkout"));
const Events = lazy(() => import("./pages/Events"));
const Radio = lazy(() => import("./pages/Radio"));
const Equipment = lazy(() => import("./pages/Equipment"));
const SessionLog = lazy(() => import("./pages/SessionLog"));
const Community = lazy(() => import("./pages/Community"));
const Story = lazy(() => import("./pages/Story"));
const Tour = lazy(() => import("./pages/Tour"));
const Tour360 = lazy(() => import("./pages/Tour360"));
const FoodMenu = lazy(() => import("./pages/FoodMenu"));
const CampaignBriefs = lazy(() => import("./pages/CampaignBriefs"));
const Academy = lazy(() => import("./pages/Academy"));
const Help = lazy(() => import("./pages/Help"));
const HelpArticle = lazy(() => import("./pages/HelpArticle"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Support = lazy(() => import("./pages/Support"));
const RedeemCode = lazy(() => import("./pages/RedeemCode"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Contact = lazy(() => import("./pages/Contact"));
const OfflinePage = lazy(() => import("./pages/OfflinePage"));
const SocialFeed = lazy(() => import("./pages/SocialFeed"));
const ArtistSocialHub = lazy(() => import("./pages/ArtistSocialHub"));
const Team = lazy(() => import("./pages/Team"));
const TeamMemberProfile = lazy(() => import("./pages/TeamMemberProfile"));


// Creation Center
const CreationCenter = lazy(() => import("./pages/CreationCenter"));
const CCGaming = lazy(() => import("./pages/creation-center/Gaming"));
const CCModeling = lazy(() => import("./pages/creation-center/Modeling"));
const CCShows = lazy(() => import("./pages/creation-center/Shows"));
const CCContent = lazy(() => import("./pages/creation-center/Content"));
const CCPodcasting = lazy(() => import("./pages/creation-center/Podcasting"));

// Editing Suite
const Editing = lazy(() => import("./pages/Editing"));
const EditingCore = lazy(() => import("./pages/editing-suite/Core"));
const EditingStreaming = lazy(() => import("./pages/editing-suite/Streaming"));
const EditingVoiceover = lazy(() => import("./pages/editing-suite/Voiceover"));
const EditingPlatform = lazy(() => import("./pages/editing-suite/Platform"));
const EditingRental = lazy(() => import("./pages/editing-suite/Rental"));

// Editing Suite (new v4 sub-pages)
const ESAnimation = lazy(() => import("./pages/editing-suite/Animation"));
const ESCampaign = lazy(() => import("./pages/editing-suite/Campaign"));
const ESPhoto = lazy(() => import("./pages/editing-suite/Photo"));
const ESQR = lazy(() => import("./pages/editing-suite/QR"));
const ESVideo = lazy(() => import("./pages/editing-suite/Video"));
const ESAudio = lazy(() => import("./pages/editing-suite/Audio"));
const ESColor = lazy(() => import("./pages/editing-suite/Color"));

// Recording & Radio
const RecordingRadio = lazy(() => import("./pages/RecordingRadio"));
const RRStudio = lazy(() => import("./pages/recording-radio/Studio"));
const RRRadio = lazy(() => import("./pages/recording-radio/RadioPage"));
const RRProduction = lazy(() => import("./pages/recording-radio/Production"));

// Mixtapes
const Mixtapes = lazy(() => import("./pages/Mixtapes"));
const MixCurrent = lazy(() => import("./pages/mixtapes/Current"));
const MixArchive = lazy(() => import("./pages/mixtapes/ArchivePage"));
const MixBuy = lazy(() => import("./pages/mixtapes/Buy"));

// Digital Vinyl
const VinylHub = lazy(() => import("./pages/vinyl/Index"));
const VinylArtists = lazy(() => import("./pages/vinyl/Artists"));
const VinylFans = lazy(() => import("./pages/vinyl/Fans"));
const VinylStreaming = lazy(() => import("./pages/vinyl/Streaming"));
const VinylProducts = lazy(() => import("./pages/vinyl/Products"));

// My Label
const ArtistLabel = lazy(() => import("./pages/ArtistLabel"));
const ALLegal = lazy(() => import("./pages/artist-label/Legal"));
const ALMarketing = lazy(() => import("./pages/artist-label/Marketing"));
const ALCampaigns = lazy(() => import("./pages/artist-label/Campaigns"));
const ALDistribution = lazy(() => import("./pages/artist-label/Distribution"));
const ALFinance = lazy(() => import("./pages/artist-label/Finance"));

// Street Team
const StreetTeam = lazy(() => import("./pages/StreetTeam"));
const STJoin = lazy(() => import("./pages/street-team/Join"));
const STDashboard = lazy(() => import("./pages/street-team/Dashboard"));
const STTasks = lazy(() => import("./pages/street-team/Tasks"));
const STRewards = lazy(() => import("./pages/street-team/Rewards"));
const STRecruitment = lazy(() => import("./pages/street-team/Recruitment"));

// My Clothing
const ArtistClothing = lazy(() => import("./pages/ArtistClothing"));
const ACDesigner = lazy(() => import("./pages/artist-clothing/Designer"));
const ACProducts = lazy(() => import("./pages/artist-clothing/Products"));
const ACOrders = lazy(() => import("./pages/artist-clothing/Orders"));
const ACEarnings = lazy(() => import("./pages/artist-clothing/Earnings"));

// Admin
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings"));
const AdminMembers = lazy(() => import("./pages/admin/AdminMembers"));
const AdminRevenue = lazy(() => import("./pages/admin/AdminRevenue"));
const AdminEquipment = lazy(() => import("./pages/admin/AdminEquipment"));
const AdminEvents = lazy(() => import("./pages/admin/AdminEvents"));
const AdminRadio = lazy(() => import("./pages/admin/AdminRadio"));
const AdminShop = lazy(() => import("./pages/admin/AdminShop"));
const AdminSessionLog = lazy(() => import("./pages/admin/AdminSessionLog"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminMedia = lazy(() => import("./pages/admin/AdminMedia"));
const AdminVehicles = lazy(() => import("./pages/admin/AdminVehicles"));
const AdminEnquiries = lazy(() => import("./pages/admin/AdminEnquiries"));
const AdminStreetTeam = lazy(() => import("./pages/admin/AdminStreetTeam"));
const AdminClothingOrders = lazy(() => import("./pages/admin/AdminClothingOrders"));
const AdminCollabo = lazy(() => import("./pages/admin/AdminCollabo"));
const AdminHelpCentre = lazy(() => import("./pages/admin/AdminHelpCentre"));
const AdminSignIn = lazy(() => import("./pages/admin/AdminSignIn"));
const AdminEmailLog = lazy(() => import("./pages/admin/AdminEmailLog"));
const AdminContactMessages = lazy(() => import("./pages/admin/AdminContactMessages"));
const AdminRedemptionCodes = lazy(() => import("./pages/admin/AdminRedemptionCodes"));
const AdminLoyaltyPoints = lazy(() => import("./pages/admin/AdminLoyaltyPoints"));
const AdminVinylVault = lazy(() => import("./pages/admin/AdminVinylVault"));
const AdminArtists = lazy(() => import("./pages/admin/AdminArtists"));
const AdminStaffRoles = lazy(() => import("./pages/admin/AdminStaffRoles"));
const AdminPersonProfile = lazy(() => import("./pages/admin/AdminPersonProfile"));
const AdminProducers = lazy(() => import("./pages/admin/AdminProducers"));
const AdminCampaignBriefs = lazy(() => import("./pages/admin/AdminCampaignBriefs"));
const AdminTasks = lazy(() => import("./pages/admin/AdminTasks"));
const AdminTimesheets = lazy(() => import("./pages/admin/AdminTimesheets"));
const AdminBans = lazy(() => import("./pages/admin/AdminBans"));

// Social & Advanced
const ArtistProfile = lazy(() => import("./pages/ArtistProfile"));
const Strategy = lazy(() => import("./pages/Strategy"));
const Unlock = lazy(() => import("./pages/Unlock"));

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const Loading = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Crown className="w-8 h-8 text-primary animate-pulse-gold" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <BrowserRouter>
          <ScrollToTop />
          <AuthProvider>
            <AudioPlayerProvider>
              <Suspense fallback={<Loading />}>
                <Routes>
                  {/* Core */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/login" element={<Auth />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/dashboard/upload-music" element={<ProtectedRoute><UploadMusic /></ProtectedRoute>} />
                  <Route path="/dashboard/my-vault" element={<ProtectedRoute><MyVault /></ProtectedRoute>} />
                  <Route path="/dashboard/earnings" element={<ProtectedRoute><Earnings /></ProtectedRoute>} />
                  <Route path="/dashboard/qr-generator" element={<ProtectedRoute><QRGenerator /></ProtectedRoute>} />
                  <Route path="/dashboard/build-points" element={<ProtectedRoute><BuildPoints /></ProtectedRoute>} />
                  <Route path="/dashboard/credits" element={<ProtectedRoute><Credits /></ProtectedRoute>} />
                  <Route path="/dashboard/admin" element={<ProtectedRoute permission="manage_settings"><AdminOps /></ProtectedRoute>} />
                  <Route path="/dashboard/studio-manager" element={<ProtectedRoute permission="manage_bookings"><StudioManager /></ProtectedRoute>} />
                  <Route path="/dashboard/producer" element={<ProtectedRoute permission="view_assigned_sessions"><Producer /></ProtectedRoute>} />
                  <Route path="/dashboard/cleaner" element={<ProtectedRoute permission="view_cleaning_tasks"><Cleaner /></ProtectedRoute>} />
                  <Route path="/dashboard/client" element={<ProtectedRoute><Client /></ProtectedRoute>} />
                  <Route path="/book" element={<Book />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/info" element={<Info />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/radio" element={<Radio />} />
                  <Route path="/equipment" element={<Equipment />} />
                  <Route path="/log" element={<SessionLog />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/story" element={<Story />} />
                  <Route path="/tour" element={<Tour />} />
                  <Route path="/360-tour" element={<Tour360 />} />
                  <Route path="/food" element={<FoodMenu />} />
                  <Route path="/campaign-briefs" element={<CampaignBriefs />} />
                  <Route path="/academy" element={<Academy />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/help/:slug" element={<HelpArticle />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/redeem" element={<RedeemCode />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/team/:memberSlug" element={<TeamMemberProfile />} />
                  <Route path="/offline" element={<OfflinePage />} />

                  <Route path="/social-feed" element={<SocialFeed />} />
                  <Route path="/artist-social-hub" element={<ArtistSocialHub />} />

                  {/* Creation Center */}
                  <Route path="/creation-center" element={<CreationCenter />} />
                  <Route path="/creation-center/gaming" element={<CCGaming />} />
                  <Route path="/creation-center/modeling" element={<CCModeling />} />
                  <Route path="/creation-center/shows" element={<CCShows />} />
                  <Route path="/creation-center/content" element={<CCContent />} />
                  <Route path="/creation-center/podcasting" element={<CCPodcasting />} />

                  {/* Editing Suite — canonical routes */}
                  <Route path="/editing-suite" element={<Editing />} />
                  <Route path="/editing-suite/core" element={<EditingCore />} />
                  <Route path="/editing-suite/streaming" element={<EditingStreaming />} />
                  <Route path="/editing-suite/voiceover" element={<EditingVoiceover />} />
                  <Route path="/editing-suite/platform" element={<EditingPlatform />} />
                  <Route path="/editing-suite/rental" element={<EditingRental />} />
                  <Route path="/editing-suite/animation" element={<ESAnimation />} />
                  <Route path="/editing-suite/campaign" element={<ESCampaign />} />
                  <Route path="/editing-suite/photo" element={<ESPhoto />} />
                  <Route path="/editing-suite/qr" element={<ESQR />} />
                  <Route path="/editing-suite/video" element={<ESVideo />} />
                  <Route path="/editing-suite/audio" element={<ESAudio />} />
                  <Route path="/editing-suite/color" element={<ESColor />} />

                  {/* Legacy redirects */}
                  <Route path="/editing" element={<Editing />} />
                  <Route path="/editing/core" element={<EditingCore />} />
                  <Route path="/editing/streaming" element={<EditingStreaming />} />
                  <Route path="/editing/voiceover" element={<EditingVoiceover />} />
                  <Route path="/editing/platform" element={<EditingPlatform />} />
                  <Route path="/editing/rental" element={<EditingRental />} />

                  {/* Recording & Radio */}
                  <Route path="/recording-radio" element={<RecordingRadio />} />
                  <Route path="/recording-radio/studio" element={<RRStudio />} />
                  <Route path="/recording-radio/radio" element={<RRRadio />} />
                  <Route path="/recording-radio/production" element={<RRProduction />} />

                  {/* Mixtapes */}
                  <Route path="/mixtapes" element={<Mixtapes />} />
                  <Route path="/mixtapes/current" element={<MixCurrent />} />
                  <Route path="/mixtapes/archive" element={<MixArchive />} />
                  <Route path="/mixtapes/buy" element={<MixBuy />} />

                  {/* Digital Vinyl */}
                  <Route path="/vinyl" element={<VinylHub />} />
                  <Route path="/vinyl/artists" element={<VinylArtists />} />
                  <Route path="/vinyl/fans" element={<VinylFans />} />
                  <Route path="/vinyl/streaming" element={<VinylStreaming />} />
                  <Route path="/vinyl/products" element={<VinylProducts />} />

                  {/* My Label (protected) */}
                  <Route path="/artist-label" element={<ProtectedRoute><ArtistLabel /></ProtectedRoute>} />
                  <Route path="/artist-label/legal" element={<ProtectedRoute><ALLegal /></ProtectedRoute>} />
                  <Route path="/artist-label/marketing" element={<ProtectedRoute><ALMarketing /></ProtectedRoute>} />
                  <Route path="/artist-label/campaigns" element={<ProtectedRoute><ALCampaigns /></ProtectedRoute>} />
                  <Route path="/artist-label/distribution" element={<ProtectedRoute><ALDistribution /></ProtectedRoute>} />
                  <Route path="/artist-label/finance" element={<ProtectedRoute><ALFinance /></ProtectedRoute>} />

                  {/* Street Team */}
                  <Route path="/street-team" element={<StreetTeam />} />
                  <Route path="/street-team/join" element={<STJoin />} />
                  <Route path="/street-team/dashboard" element={<ProtectedRoute><STDashboard /></ProtectedRoute>} />
                  <Route path="/street-team/tasks" element={<ProtectedRoute><STTasks /></ProtectedRoute>} />
                  <Route path="/street-team/rewards" element={<ProtectedRoute><STRewards /></ProtectedRoute>} />
                  <Route path="/street-team/recruitment" element={<ProtectedRoute><STRecruitment /></ProtectedRoute>} />

                  {/* Shop */}
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/shop/digital-vinyl" element={<ShopDigitalVinyl />} />
                  <Route path="/shop/usb-bundles" element={<ShopUSBBundles />} />
                  <Route path="/shop/nfts" element={<ShopNFTs />} />
                  <Route path="/shop/exclusive" element={<ShopExclusive />} />
                  <Route path="/shop/clothing" element={<ShopClothing />} />
                  <Route path="/shop/checkout" element={<ProtectedRoute><ShopCheckout /></ProtectedRoute>} />

                  {/* My Clothing (protected) */}
                  <Route path="/artist-clothing" element={<ProtectedRoute><ArtistClothing /></ProtectedRoute>} />
                  <Route path="/artist-clothing/designer" element={<ProtectedRoute><ACDesigner /></ProtectedRoute>} />
                  <Route path="/artist-clothing/products" element={<ProtectedRoute><ACProducts /></ProtectedRoute>} />
                  <Route path="/artist-clothing/orders" element={<ProtectedRoute><ACOrders /></ProtectedRoute>} />
                  <Route path="/artist-clothing/earnings" element={<ProtectedRoute><ACEarnings /></ProtectedRoute>} />

                  {/* Admin */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminOverview />} />
                    <Route path="bookings" element={<AdminBookings />} />
                    <Route path="members" element={<AdminMembers />} />
                    <Route path="revenue" element={<AdminRevenue />} />
                    <Route path="enquiries" element={<AdminEnquiries />} />
                    <Route path="equipment" element={<AdminEquipment />} />
                    <Route path="events" element={<AdminEvents />} />
                    <Route path="radio" element={<AdminRadio />} />
                    <Route path="shop" element={<AdminShop />} />
                    <Route path="street-team" element={<AdminStreetTeam />} />
                    <Route path="clothing-orders" element={<AdminClothingOrders />} />
                    <Route path="collabo" element={<AdminCollabo />} />
                    <Route path="session-log" element={<AdminSessionLog />} />
                    <Route path="sign-in" element={<AdminSignIn />} />
                    <Route path="help-centre" element={<AdminHelpCentre />} />
                    <Route path="email-log" element={<AdminEmailLog />} />
                    <Route path="redemption-codes" element={<AdminRedemptionCodes />} />
                    <Route path="contact-messages" element={<AdminContactMessages />} />
                    <Route path="vehicles" element={<AdminVehicles />} />
                    <Route path="loyalty-points" element={<AdminLoyaltyPoints />} />
                    <Route path="vinyl-vault" element={<AdminVinylVault />} />
                    <Route path="artists" element={<AdminArtists />} />
                    <Route path="producers" element={<AdminProducers />} />
                    <Route path="campaign-briefs" element={<AdminCampaignBriefs />} />
                    <Route path="tasks" element={<AdminTasks />} />
                    <Route path="timesheets" element={<AdminTimesheets />} />
                    <Route path="bans" element={<AdminBans />} />
                    <Route path="people/:personId" element={<AdminPersonProfile />} />
                    <Route path="staff-roles" element={<AdminStaffRoles />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="media" element={<AdminMedia />} />
                  </Route>

                  {/* Public artist profile */}
                  <Route path="/artists/:username" element={<ArtistProfile />} />

                  {/* QR Physical-to-Digital unlock page — no auth required */}
                  <Route path="/unlock/:code" element={<Unlock />} />

                  {/* Strategy */}
                  <Route path="/strategy" element={<Strategy />} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
                <AudioPlayerBar />
                <MobileTabBar />
                <HelpWidget />
                <GlobalSearch />
              </Suspense>
            </AudioPlayerProvider>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
