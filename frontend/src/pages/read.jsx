import { useEffect, useState } from "react";
import Header from "../components/header";
import { Button } from "@/components/ui/button";
import { useTelegramUser } from "./../hooks/useTelegramUser";
import BookDetailPage from "./BookDetailPage";
import { useSearchParams } from "react-router-dom";

const BookCard = ({ book, onBookClick }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="cursor-pointer overflow-hidden rounded-xl bg-zinc-800 p-3 transition-transform hover:scale-105 active:scale-95"
      onClick={() => onBookClick(book)}
    >
      <div className="mb-3 flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-lg bg-gray-700">
        {!imageError ? (
          <img
            src={book.coverImageUrl}
            alt={book.title}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <div className="mb-2 text-2xl">📚</div>
            <div className="px-2 text-center text-xs">No Image</div>
          </div>
        )}
      </div>
      <div className="space-y-1 text-white">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight">
          {book.title || "Untitled"}
        </h3>
        {/* <p className="text-xs text-gray-300 leading-tight line-clamp-1">
          {book.author || "Unknown Author"}
        </p> */}
      </div>
    </div>
  );
};

export default function Read() {
  const { user, isLoaded } = useTelegramUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get("selected");
  const displayName =
    isLoaded && user
      ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`
      : "Guest User";

  // const [selectedBook, setSelectedBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [type, setType] = useState("all");
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const selectedBook = books.find((b) => b._id === selectedId);

  const fetchBooks = async (page) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/book?page=${page}&limit=${limit}&type=${type === "all" ? "" : type === "free" ? "free" : "premium"}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();

      if (result.data && Array.isArray(result.data.books)) {
        setBooks(result.data.books);
        setTotalPages(Math.ceil((result.data.total || 0) / limit));
      } else {
        setBooks([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to fetch books", err);
      setBooks([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(page);
  }, [page, type]);

  const handleBookClick = (book) => {
    setSearchParams({ selected: book._id });
  };

  const handleBackToBooks = () => {
    setSearchParams({});
  };

  if (selectedBook) {
    return (
      <div className="flex h-[100dvh] flex-col bg-brandblue">
        <div className="flex-1 overflow-y-auto">
          <BookDetailPage book={selectedBook} onBack={handleBackToBooks} />
        </div>
      </div>
    );
  }

  const typeUI = (
    <div className="flex items-center gap-2 pb-2">
      {["all", "free", "premium"].map((t, i) => (
        <button
          onClick={() => setType(t)}
          key={i}
          className={`z-10 rounded-full px-3 py-1 text-xs font-medium uppercase transition-colors ${type === t ? "border border-background bg-background text-brandblue" : "border border-background bg-transparent text-background hover:bg-background/10"}`}
        >
          {t}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex h-[100dvh] flex-col bg-brandblue">
      <div className="webkit-overflow-scrolling-touch flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-md flex-col space-y-4 px-4 py-4 pb-20">
          <Header />
          <div className="text-xl text-white">
            <div>
              <span className="font-semibold">Hey,</span> {displayName}
            </div>
            <div className="font-semibold">What will you read today?</div>
          </div>

          {typeUI}

          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="overflow-hidden rounded-xl bg-zinc-800 p-3">
                    <div className="mb-3 aspect-[3/4] w-full rounded-lg bg-gray-700"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 rounded bg-gray-700"></div>
                      <div className="h-3 w-1/2 rounded bg-gray-700"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : books.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {books.map((book) => (
                <BookCard
                  key={book._id || book.id || Math.random()}
                  book={book}
                  onBookClick={handleBookClick}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-white">
              <div className="mb-2 text-4xl">📚</div>
              <div className="mb-1 text-lg font-semibold">No books found</div>
              <div className="text-sm text-gray-300">
                Check back later for new books
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pb-10 pt-6">
            <Button
              variant="outline"
              className="text-black"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
            >
              Prev
            </Button>
            <span className="text-sm text-white">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              className="text-black"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
