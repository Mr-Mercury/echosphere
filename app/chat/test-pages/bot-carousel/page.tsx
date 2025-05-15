import PopularBotsContainer from "@/components/bot-display/bot-carousel/popular-bots-container";
import { Button } from "@/components/ui/button";

export default function TestPage() {
    const handleViewAll = () => {
        console.log("View all clicked");
        // Navigate to bot explorer or other destination
    };

    return (
        <div className="w-full">
            {/* Custom title and button section */}
            <div className="w-full px-6 pt-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Currently Popular Bots</h2>
                <Button variant="link" onClick={handleViewAll}>
                    View all
                </Button>
            </div>
            
            {/* Carousel without its own title */}
            <PopularBotsContainer 
                title="Currently Popular Bots" 
                onViewAll={handleViewAll}
                showTitle={false}
            />
        </div>
    );
}

