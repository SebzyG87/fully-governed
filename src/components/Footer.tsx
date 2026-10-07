import { Crown, Instagram, MessageCircle, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-12 bg-card border-t border-border">
      <div className="container px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-primary" />
              <span className="font-bebas text-xl tracking-widest text-foreground">FULLY GOVERNED</span>
            </div>
            <p className="text-xs text-muted-foreground font-barlow">
              Professional music studio & content creation centre in Lewisham, South East London. Open 24/7.
            </p>
          </div>

          <div>
            <h3 className="font-bebas text-lg text-foreground tracking-wider mb-3">GETTING HERE</h3>
            <div className="space-y-2 text-xs text-muted-foreground font-barlow">
              <p>174–178 V22 Building, Unit 1B–1C<br />Lewisham, London (Gated Community)</p>
              <p>🚂 Lewisham Station — 5 min walk<br />(trains to London Bridge, Cannon Street, Charing Cross)</p>
              <p>🚂 Hither Green Station — 5 min walk<br />(trains to London Bridge)</p>
              <p>🚌 Buses: <a href="https://tfl.gov.uk/plan-a-journey/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Plan your journey</a></p>
              <p>🅿️ Secure on-site parking</p>
            </div>
          </div>

          <div>
            <h3 className="font-bebas text-lg text-foreground tracking-wider mb-3">QUICK LINKS</h3>
            <div className="space-y-2 text-xs font-barlow">
              <Link to="/book" className="block text-muted-foreground hover:text-interactive transition-colors">Book a Session</Link>
              <Link to="/help" className="block text-muted-foreground hover:text-interactive transition-colors">Help Centre</Link>
              <Link to="/support" className="block text-muted-foreground hover:text-interactive transition-colors">Support Services</Link>
              <Link to="/contact" className="block text-muted-foreground hover:text-interactive transition-colors">Contact Us</Link>
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="font-bebas text-lg text-foreground tracking-wider mb-3">CONNECT</h3>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <a href="https://instagram.com/fullygoverned" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-interactive transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://tiktok.com/@fullygoverned" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-interactive transition-colors" aria-label="TikTok">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78c.27 0 .54.04.79.1V8.98a6.34 6.34 0 1 0 5.49 6.29V9.4a8.16 8.16 0 0 0 3.82.95V6.69Z" /></svg>
              </a>
              <a href="https://youtube.com/@fullygoverned" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-interactive transition-colors" aria-label="YouTube">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.84.55 9.38.55 9.38.55s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81ZM9.75 15.02V8.98L15.5 12l-5.75 3.02Z" /></svg>
              </a>
              <a href="https://soundcloud.com/fullygoverned" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-interactive transition-colors" aria-label="SoundCloud">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M1.175 16.778a.239.239 0 0 1-.237-.207l-.338-2.31.338-2.344a.238.238 0 0 1 .237-.207c.131 0 .237.093.237.207l.394 2.344-.394 2.31a.237.237 0 0 1-.237.207Zm1.83.618a.238.238 0 0 1-.236-.231l-.307-2.904.307-3.044c0-.131.106-.231.236-.231.132 0 .238.1.238.23l.356 3.045-.356 2.904a.238.238 0 0 1-.238.23Zm1.863.044a.262.262 0 0 1-.262-.256l-.275-3.22.275-3.076a.262.262 0 0 1 .525 0l.319 3.076-.319 3.22a.262.262 0 0 1-.263.256Zm1.862-.044a.287.287 0 0 1-.287-.275l-.244-2.86.244-3.538a.288.288 0 0 1 .575 0l.281 3.538-.28 2.86a.287.287 0 0 1-.289.275Zm1.894.05a.312.312 0 0 1-.312-.3l-.213-2.886.213-3.819a.312.312 0 0 1 .625 0l.25 3.82-.25 2.885a.312.312 0 0 1-.313.3Zm1.894-.006a.337.337 0 0 1-.337-.325l-.181-2.854.181-4.094a.338.338 0 0 1 .675 0l.213 4.094-.213 2.854a.337.337 0 0 1-.338.325Zm1.925.006a.363.363 0 0 1-.362-.35l-.15-2.829.15-4.156a.363.363 0 0 1 .725 0l.175 4.156-.175 2.829a.363.363 0 0 1-.363.35Zm1.925-.012a.388.388 0 0 1-.387-.375l-.119-2.793.119-4.2a.388.388 0 0 1 .775 0l.137 4.2-.137 2.793a.388.388 0 0 1-.388.375Zm2.356.006a.413.413 0 0 1-.413-.4l-.087-2.778.087-4.257c0-.225.188-.4.413-.4a.41.41 0 0 1 .412.4l.1 4.257-.1 2.778a.412.412 0 0 1-.412.4Zm1.58-8.95c-.375 0-.73.069-1.063.188-.218-2.4-2.243-4.275-4.718-4.275-.625 0-1.231.131-1.787.369a.476.476 0 0 0-.275.437v9.881a.479.479 0 0 0 .43.475h7.413a2.812 2.812 0 0 0 0-5.625v-.45Z" /></svg>
              </a>
              <a href="https://wa.me/447506224965" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-interactive transition-colors" aria-label="WhatsApp">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="https://maps.google.com/?q=Fully+Governed+Lewisham" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-interactive transition-colors" aria-label="Google Maps">
                <MapPin className="w-5 h-5" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground font-barlow break-words">musicfullygoverned@gmail.com</p>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} FULLY GOVERNED · STUDIO & CONTENT CREATION CENTRE
          </p>
          <div className="flex gap-4 text-xs font-barlow">
            <Link to="/terms" className="text-muted-foreground hover:text-interactive transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-interactive transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="text-muted-foreground hover:text-interactive transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
