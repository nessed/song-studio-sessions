import { useSongs } from "@/hooks/useSessionsDB";
import { Header } from "@/components/Header";
import { useNavigate } from "react-router-dom";

export default function Library() {
  const songs = useSongs();
  const navigate = useNavigate();

  const sortedSongs = [...songs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatStatus = (status: string) => {
    return status.replace("_", " ");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Library</h1>
          <p className="text-sm text-muted-foreground">
            All your songs in one place
          </p>
        </div>

        {sortedSongs.length > 0 ? (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                    Title
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                    BPM
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                    Key
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedSongs.map((song, index) => (
                  <tr
                    key={song.id}
                    onClick={() => navigate(`/song/${song.id}`)}
                    className={`cursor-pointer hover:bg-accent/50 transition-colors ${
                      index !== sortedSongs.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {song.coverArtDataUrl ? (
                          <img
                            src={song.coverArtDataUrl}
                            alt=""
                            className="w-8 h-8 rounded object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-muted" />
                        )}
                        <span className="text-sm font-medium text-foreground">
                          {song.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="status-badge">{formatStatus(song.status)}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                      {song.bpm || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                      {song.key || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                      {formatDate(song.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-sm text-muted-foreground">
              No songs in your library yet.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
