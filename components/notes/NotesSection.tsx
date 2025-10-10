import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Note {
  id: string;
  text: string;
  date: string;
  author: string;
}

const mockNotes: Note[] = [
  { id: "1", text: "Klient požadoval zmenu splatnosti", date: "2025-10-05", author: "Admin" },
  { id: "2", text: "Faktúra bola zaslaná emailom", date: "2025-10-06", author: "Admin" },
];

export const NotesSection = () => {
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [newNote, setNewNote] = useState("");

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast.error("Zadajte text poznámky");
      return;
    }

    const note: Note = {
      id: Date.now().toString(),
      text: newNote,
      date: new Date().toISOString().split("T")[0],
      author: "Admin",
    };

    setNotes([note, ...notes]);
    setNewNote("");
    toast.success("Poznámka bola pridaná");
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
    toast.success("Poznámka bola odstránená");
  };

  return (
    <Card className="p-6 bg-gradient-card">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Poznámky</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Pridať novú poznámku..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
          />
          <Button onClick={handleAddNote} className="w-full">
            Pridať poznámku
          </Button>
        </div>

        <div className="space-y-3 mt-6">
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Zatiaľ žiadne poznámky
            </p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-lg border border-border bg-muted/50 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <p className="text-sm text-foreground">{note.text}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>{note.author}</span>
                  <span>{note.date}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
};