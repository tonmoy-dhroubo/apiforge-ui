"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
};

const COMMANDS: Array<{
	label: string;
	command: string;
	value?: string;
}> = [
	{ label: "Bold", command: "bold" },
	{ label: "Italic", command: "italic" },
	{ label: "Underline", command: "underline" },
	{ label: "H2", command: "formatBlock", value: "h2" },
	{ label: "List", command: "insertUnorderedList" },
	{ label: "Link", command: "createLink" },
	{ label: "Clear", command: "removeFormat" },
];

export function RichTextEditor({
	value,
	onChange,
	placeholder,
	className,
}: RichTextEditorProps) {
	const editorRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!editorRef.current) return;
		if (editorRef.current.innerHTML !== value) {
			editorRef.current.innerHTML = value || "";
		}
	}, [value]);

	const exec = (command: string, commandValue?: string) => {
		if (!editorRef.current) return;
		editorRef.current.focus();
		if (command === "createLink") {
			const url = window.prompt("Enter URL");
			if (!url) return;
			document.execCommand(command, false, url);
			onChange(editorRef.current.innerHTML);
			return;
		}
		document.execCommand(command, false, commandValue);
		onChange(editorRef.current.innerHTML);
	};

	return (
		<div className={cn("space-y-2", className)}>
			<div className="flex flex-wrap gap-2">
				{COMMANDS.map((item) => (
					<Button
						key={item.label}
						type="button"
						size="sm"
						variant="secondary"
						onClick={() => exec(item.command, item.value)}
						aria-label={item.label}
					>
						{item.label}
					</Button>
				))}
			</div>
			<div
				ref={editorRef}
				className="min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
				contentEditable
				suppressContentEditableWarning
				data-placeholder={placeholder}
				onInput={() => onChange(editorRef.current?.innerHTML ?? "")}
				onBlur={() => onChange(editorRef.current?.innerHTML ?? "")}
			/>
			{!value && placeholder && (
				<p className="text-xs text-muted-foreground">{placeholder}</p>
			)}
		</div>
	);
}
