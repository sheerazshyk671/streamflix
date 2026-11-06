import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./App.css";

// Free key from https://www.themoviedb.org/settings/api, saved in .env as VITE_TMDB_KEY=yourkey
const KEY: string | undefined = import.meta.env.VITE_TMDB_KEY;
const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p";

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
}
interface Video {
  key: string;
  site: string;
  type: string;
}
interface Detail extends Movie {
  runtime: number | null;
  genres: { id: number; name: string }[];
  videos: { results: Video[] };
}
interface Page {
  results: Movie[];
}
type Selected = { movie: Movie; play: boolean };
type OpenFn = (movie: Movie, play: boolean) => void;

async function get<T>(path: string, params = ""): Promise<T> {
  const res = await fetch(`${BASE}${path}?api_key=${KEY}&language=en-US${params}`);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return (await res.json()) as T;
}

const TRENDING = "Trending this week";
const ROWS: { title: string; path: string; params?: string }[] = [
  { title: TRENDING, path: "/trending/movie/week" },
  { title: "Top rated", path: "/movie/top_rated" },
  { title: "Action", path: "/discover/movie", params: "&with_genres=28&sort_by=popularity.desc" },
  { title: "Comedy", path: "/discover/movie", params: "&with_genres=35&sort_by=popularity.desc" },
  { title: "Horror", path: "/discover/movie", params: "&with_genres=27&sort_by=popularity.desc" },
  { title: "Sci-Fi", path: "/discover/movie", params: "&with_genres=878&sort_by=popularity.desc" },
  { title: "Animation", path: "/discover/movie", params: "&with_genres=16&sort_by=popularity.desc" },
];

function useDebounced<T>(value: T, ms = 400): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

type NavbarProps = { query: string; setQuery: (q: string) => void; count: number };

function Navbar({ query, setQuery, count }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <motion.header
      className={scrolled ? "nav scrolled" : "nav"}
      initial={{ y: -70 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
    >
      <h1 className="logo">STREAMFLIX</h1>
      <nav className="nav-links">
        <a href="#top">Home</a>
        <a href="#my-list">My List ({count})</a>
      </nav>
      <input
        className="search"
        type="search"
        placeholder="Search movies"
        aria-label="Search movies"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </motion.header>
  );
}

function Hero({ movies, onOpen }: { movies: Movie[]; onOpen: OpenFn }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (movies.length === 0) return;
    const t = setInterval(() => setI((x) => (x + 1) % movies.length), 8000);
    return () => clearInterval(t);
  }, [movies, i]);
  const m = movies[i];
  if (!m) return <div className="hero skeleton" id="top" />;
  return (
    <section className="hero" id="top">
      <AnimatePresence mode="wait">
        <motion.div
          key={m.id}
          className="hero-slide"
          style={{ backgroundImage: `url(${IMG}/original${m.backdrop_path})` }}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="hero-fade" />
          <motion.div
            className="hero-text"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h2>{m.title}</h2>
            <p className="meta">★ {m.vote_average.toFixed(1)} · {m.release_date?.slice(0, 4)}</p>
            <p className="overview">{m.overview}</p>
            <div className="hero-actions">
              <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }} className="btn btn-play" onClick={() => onOpen(m, true)}>
                Play trailer
              </motion.button>
              <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }} className="btn btn-info" onClick={() => onOpen(m, false)}>
                More info
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
      <div className="dots">
        {movies.map((x, n) => (
          <button key={x.id} className={n === i ? "dot on" : "dot"} onClick={() => setI(n)} aria-label={`Show ${x.title}`} />
        ))}
      </div>
    </section>
  );
}

function Card({ movie, onOpen }: { movie: Movie; onOpen: OpenFn }) {
  return (
    <motion.button
      className="card"
      onClick={() => onOpen(movie, false)}
      whileHover={{ scale: 1.12, zIndex: 2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <img src={`${IMG}/w342${movie.poster_path}`} alt={movie.title} loading="lazy" />
      <span className="card-over">
        <strong>{movie.title}</strong>
        <small>★ {movie.vote_average.toFixed(1)}</small>
      </span>
    </motion.button>
  );
}

type RowProps = { title: string; movies?: Movie[]; onOpen: OpenFn; id?: string; ranked?: boolean };

function Row({ title, movies, onOpen, id, ranked }: RowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };
  const shown = movies?.filter((m) => m.poster_path);
  return (
    <motion.section
      className="row"
      id={id}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
    >
      <h3>{title}</h3>
      <div className="row-wrap">
        <button className="arrow left" onClick={() => scroll(-1)} aria-label="Scroll left">‹</button>
        <div className="row-scroll" ref={ref}>
          {shown
            ? shown.map((m, n) =>
                ranked ? (
                  <div key={m.id} className="ranked">
                    <span className="rank">{n + 1}</span>
                    <Card movie={m} onOpen={onOpen} />
                  </div>
                ) : (
                  <Card key={m.id} movie={m} onOpen={onOpen} />
                )
              )
            : Array.from({ length: 8 }).map((_, n) => <div key={n} className="card skeleton" />)}
        </div>
        <button className="arrow right" onClick={() => scroll(1)} aria-label="Scroll right">›</button>
      </div>
    </motion.section>
  );
}

type ModalProps = {
  movie: Movie;
  play: boolean;
  inList: boolean;
  toggleList: (movie: Movie) => void;
  onClose: () => void;
};

function Modal({ movie, play, inList, toggleList, onClose }: ModalProps) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [playing, setPlaying] = useState(play);

  useEffect(() => {
    let cancelled = false;
    get<Detail>(`/movie/${movie.id}`, "&append_to_response=videos")
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [movie.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const trailer = detail?.videos.results.find((v) => v.site === "YouTube" && v.type === "Trailer");
  const bg = movie.backdrop_path ? { backgroundImage: `url(${IMG}/w780${movie.backdrop_path})` } : undefined;

  return (
    <motion.div className="backdrop" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={movie.title}
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 60, scale: 0.92, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 60, scale: 0.92, opacity: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
      >
        <button className="close" onClick={onClose} aria-label="Close">×</button>
        <div className="modal-media" style={playing ? undefined : bg}>
          {playing && trailer ? (
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
              title={`${movie.title} trailer`}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
            />
          ) : (
            <button className="btn btn-play" disabled={!trailer} onClick={() => setPlaying(true)}>
              {detail ? (trailer ? "Play trailer" : "No trailer available") : "Loading…"}
            </button>
          )}
        </div>
        <div className="modal-body">
          <h2>{movie.title}</h2>
          <p className="meta">
            ★ {movie.vote_average.toFixed(1)} · {movie.release_date?.slice(0, 4)}
            {detail && ` · ${detail.runtime ?? "?"} min · ${detail.genres.map((g) => g.name).join(", ")}`}
          </p>
          <p>{movie.overview}</p>
          <motion.button whileTap={{ scale: 0.95 }} className="btn btn-info" onClick={() => toggleList(movie)}>
            {inList ? "Remove from My List" : "Add to My List"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

const loadList = (): Movie[] => {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem("myList") ?? "[]");
    return Array.isArray(saved) ? (saved as Movie[]) : [];
  } catch {
    return [];
  }
};

export default function App() {
  const [rows, setRows] = useState<Record<string, Movie[]>>({});
  const [error, setError] = useState(
    KEY ? "" : "Add your TMDB key to a .env file as VITE_TMDB_KEY, then restart npm run dev."
  );
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[] | null>(null);
  const [selected, setSelected] = useState<Selected | null>(null);
  const [myList, setMyList] = useState<Movie[]>(loadList);
  const q = useDebounced(query.trim());

  useEffect(() => {
    if (!KEY) return;
    Promise.all(ROWS.map((r) => get<Page>(r.path, r.params)))
      .then((all) => setRows(Object.fromEntries(ROWS.map((r, n) => [r.title, all[n].results]))))
      .catch((e: Error) => setError(`Could not load movies: ${e.message}. Check your API key and internet.`));
  }, []);

  useEffect(() => {
    if (!q || !KEY) {
      setResults(null);
      return;
    }
    let cancelled = false;
    get<Page>("/search/movie", `&query=${encodeURIComponent(q)}`)
      .then((d) => {
        if (!cancelled) setResults(d.results);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      });
    return () => {
      cancelled = true;
    };
  }, [q]);

  useEffect(() => {
    try {
      localStorage.setItem("myList", JSON.stringify(myList));
    } catch {
      // storage unavailable: My List just won't persist
    }
  }, [myList]);

  const heroMovies = useMemo(
    () => (rows[TRENDING] ?? []).filter((m) => m.backdrop_path).slice(0, 5),
    [rows]
  );
  const top10 = (rows[TRENDING] ?? []).filter((m) => m.poster_path).slice(0, 10);

  const toggleList = (m: Movie) =>
    setMyList((l) => (l.some((x) => x.id === m.id) ? l.filter((x) => x.id !== m.id) : [...l, m]));
  const open: OpenFn = (movie, play) => setSelected({ movie, play });

  return (
    <>
      <Navbar query={query} setQuery={setQuery} count={myList.length} />
      {error && <p className="error">{error}</p>}
      {!query && <Hero movies={heroMovies} onOpen={open} />}
      <main className={query ? "main searching" : "main"}>
        {query ? (
          <>
            <Row title={`Results for "${query.trim()}"`} movies={results ?? undefined} onOpen={open} />
            {results?.length === 0 && <p className="empty">No movies found. Try another title.</p>}
          </>
        ) : (
          <>
            {myList.length > 0 && <Row id="my-list" title="My List" movies={myList} onOpen={open} />}
            {top10.length > 0 && <Row title="Top 10 this week" movies={top10} onOpen={open} ranked />}
            {ROWS.map((r) => (
              <Row key={r.title} title={r.title} movies={rows[r.title]} onOpen={open} />
            ))}
          </>
        )}
      </main>
      <footer className="footer">
        This product uses the TMDB API but is not endorsed or certified by{" "}
        <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer">TMDB</a>.
      </footer>
      <AnimatePresence>
        {selected && (
          <Modal
            key={selected.movie.id}
            movie={selected.movie}
            play={selected.play}
            inList={myList.some((x) => x.id === selected.movie.id)}
            toggleList={toggleList}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
