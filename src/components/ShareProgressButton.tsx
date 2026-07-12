import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics/events";

type ShareProgressButtonProps = {
  completed: number;
  total: number;
};

const ShareProgressButton = ({ completed, total }: ShareProgressButtonProps) => {
  const { toast } = useToast();

  const handleShare = async () => {
    trackEvent("progress_share");
    const text =
      total > 0
        ? `I completed ${completed}/${total} exercises this week with GoMove 💪`
        : "I'm building my personalized exercise plan with GoMove 💪";
    const shareData = {
      title: "GoMove",
      text,
      url: "https://gomove.fit",
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled the native share sheet — nothing to do
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(`${text} ${shareData.url}`);
      toast({ title: "Copied to clipboard", description: "Paste it anywhere to share your progress." });
    } catch {
      toast({ variant: "destructive", title: "Could not share progress" });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleShare} className="shrink-0 gap-1.5">
      <Share2 className="h-4 w-4" />
      Share
    </Button>
  );
};

export default ShareProgressButton;
