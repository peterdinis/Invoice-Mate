"use client"

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
    showAfter?: number; // pixels scrolled before button appears
    ariaLabel?: string;
};


export default function ScrollToTop({ showAfter = 300, ariaLabel = "Scroll to top" }: Props) {
    const [visible, setVisible] = useState(false);


    useEffect(() => {
        const onScroll = () => {
            setVisible(window.scrollY > showAfter);
        };


        // initialize
        onScroll();


        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [showAfter]);


    const handleClick = () => {
        // Respect reduced motion preference
        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


        if (prefersReduced) {
            window.scrollTo({ top: 0 });
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };


    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.18 }}
                    className="fixed right-6 bottom-6 z-50"
                >
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={handleClick}
                                aria-label={ariaLabel}
                                className="h-10 w-10 rounded-full p-0 shadow-lg"
                                variant="default"
                            >
                                <ArrowUp className="h-4 w-4" />
                                <span className="sr-only">{ariaLabel}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{ariaLabel}</p>
                        </TooltipContent>
                    </Tooltip>
                </motion.div>
            )}
        </AnimatePresence>
    );
}