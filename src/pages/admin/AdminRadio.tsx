import { useCallback, useEffect, useState } from "react";
import { CircleCheck, Clock3, ExternalLink, Mail, Music2, Radio, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type RadioRequest = {
  id: string;
  name: string;
  email: string;
  description: string | null;
  status: string;
  created_at: string;
};

type ReviewTrack = {
  id: string;
  title: string;
  genre: string | null;
  file_url: string | null;
  created_at: string;
};

const AdminRadio = () => {
  const [requests, setRequests] = useState<RadioRequest[]>([]);
  const [tracks, setTracks] = useState<ReviewTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadQueue = useCallback(async () => {
    setLoading(true);
    const [requestResult, trackResult] = await Promise.all([
      supabase.from("quote_requests").select("id, name, email, description, status, created_at").eq("service", "Radio show proposal").order("created_at", { ascending: false }),
      supabase.from("music_tracks").select("id, title, genre, file_url, created_at").eq("status", "pending_review").order("created_at", { ascending: false }),
    ]);
    if (requestResult.error || trackResult.error) {
      toast({ title: "Radio queue unavailable", description: "Check the Supabase connection and admin permissions.", variant: "destructive" });
    }
    setRequests((requestResult.data ?? []) as RadioRequest[]);
    setTracks((trackResult.data ?? []) as ReviewTrack[]);
    setLoading(false);
  }, [toast]);

  useEffect(() => { void loadQueue(); }, [loadQueue]);

  const markReviewed = async (id: string) => {
    setBusyId(id);
    const { error } = await supabase.from("quote_requests").update({ status: "reviewed" }).eq("id", id);
    if (error) toast({ title: "Could not update request", description: error.message, variant: "destructive" });
    else toast({ title: "Request marked reviewed" });
    setBusyId(null);
    if (!error) await loadQueue();
  };

  const publishTrack = async (id: string) => {
    setBusyId(id);
    const { error } = await supabase.from("music_tracks").update({ status: "published" }).eq("id", id);
    if (error) toast({ title: "Could not publish track", description: error.message, variant: "destructive" });
    else toast({ title: "Track published", description: "It can now appear in the public Radio player." });
    setBusyId(null);
    if (!error) await loadQueue();
  };

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-bebas text-4xl text-foreground">RADIO</h1>
          <p className="font-barlow text-sm text-muted-foreground">Review show proposals and submitted releases.</p>
        </div>
        <Button variant="outline" size="icon" title="Refresh radio queues" aria-label="Refresh radio queues" onClick={() => void loadQueue()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </header>

      <section aria-labelledby="show-proposals" className="space-y-3">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <Radio className="h-5 w-5 text-primary" />
          <h2 id="show-proposals" className="font-bebas text-2xl text-foreground">SHOW PROPOSALS</h2>
          <span className="ml-auto font-mono text-xs text-muted-foreground">{requests.length}</span>
        </div>
        {requests.length === 0 && !loading ? <p className="py-5 text-sm text-muted-foreground">No show proposals to review.</p> : null}
        <div className="divide-y divide-border">
          {requests.map((request) => (
            <article key={request.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1">
                <h3 className="font-semibold text-foreground">{request.name}</h3>
                <a className="inline-flex items-center gap-1 text-sm text-primary hover:underline" href={`mailto:${request.email}`}><Mail className="h-3.5 w-3.5" />{request.email}</a>
                {request.description ? <p className="max-w-3xl whitespace-pre-wrap text-sm text-muted-foreground">{request.description}</p> : null}
                <p className="text-xs text-muted-foreground">{new Date(request.created_at).toLocaleDateString()} · {request.status}</p>
              </div>
              {request.status === "pending" ? <Button size="sm" variant="outline" onClick={() => void markReviewed(request.id)} disabled={busyId === request.id}><CircleCheck className="mr-2 h-4 w-4" />Mark reviewed</Button> : null}
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="track-review" className="space-y-3">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <Music2 className="h-5 w-5 text-primary" />
          <h2 id="track-review" className="font-bebas text-2xl text-foreground">TRACK REVIEW</h2>
          <span className="ml-auto font-mono text-xs text-muted-foreground">{tracks.length}</span>
        </div>
        {tracks.length === 0 && !loading ? <p className="py-5 text-sm text-muted-foreground">No music submissions are waiting for review.</p> : null}
        <div className="divide-y divide-border">
          {tracks.map((track) => (
            <article key={track.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-foreground">{track.title}</h3>
                <p className="text-sm text-muted-foreground">{track.genre || "Genre not supplied"} · <Clock3 className="inline h-3 w-3" /> {new Date(track.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                {track.file_url ? <Button asChild size="sm" variant="outline"><a href={track.file_url} target="_blank" rel="noreferrer">Preview <ExternalLink className="ml-2 h-3.5 w-3.5" /></a></Button> : null}
                <Button size="sm" onClick={() => void publishTrack(track.id)} disabled={busyId === track.id}><CircleCheck className="mr-2 h-4 w-4" />Publish to Radio</Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminRadio;
