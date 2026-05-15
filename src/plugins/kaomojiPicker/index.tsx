/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ChatBarButton, ChatBarButtonFactory } from "@api/ChatButtons";
import { BaseText } from "@components/BaseText";
import { Button } from "@components/Button";
import { Card } from "@components/Card";
import { Divider } from "@components/Divider";
import { Flex } from "@components/Flex";
import { Grid } from "@components/Grid";
import { Devs } from "@utils/constants";
import { insertTextIntoChatInputBox } from "@utils/discord";
import definePlugin from "@utils/types";
import { Popout, ScrollerThin, TextInput, useMemo, useRef, useState } from "@webpack/common";

import KAOMOJI_DB from "./kaomoji-db.json";

const MAX_RESULTS_CAP: number = 500;

type KaomojiEntry = {
    text: string;
    subcategory: string;
};

const populateKaomojiEntries = (kaomojiDb: any) => {
    const entries: KaomojiEntry[] = [];

    for (const value of Object.values(kaomojiDb as Record<string, Record<string, string[]>>)) {
        for (const [subcategory, list] of Object.entries(value)) {
            for (const text of list) {
                entries.push({ text, subcategory });
            }
        }
    }
    return entries;
};

const kaomojiEntries: KaomojiEntry[] = populateKaomojiEntries(KAOMOJI_DB);

const KaomojiPicker = ({ maxResultsCap = 250, onPick }: { maxResultsCap?: number, onPick: () => void; }) => {
    const [queryText, setQueryText] = useState<string>("");
    const [current, setCurrent] = useState<string | null>(null);

    const query: string = queryText.trim().toLowerCase();

    const results: KaomojiEntry[] = useMemo(
        () =>
            query === ""
                ? []
                : kaomojiEntries
                    .filter(
                        ({ text, subcategory }) =>
                            text.toLowerCase().includes(query) ||
                            subcategory.toLowerCase().includes(query)
                    )
                    .slice(0, maxResultsCap),
        [query, maxResultsCap]
    );

    return (
        <Card
            style={{
                width: 350,
                height: 486, // discord emoji picker height lmao
                marginBottom: "12px",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                background: "var(--background-surface-high)",
                padding: 0,
                border: "1px solid var(--border-subtle)"
            }}
        >
            <div style={{ padding: "12px", background: "var(--background-surface-high)" }}>
                <TextInput
                    value={queryText}
                    placeholder="Search kaomoji..."
                    onChange={setQueryText}
                    autoFocus
                />
            </div>

            <Divider style={{ margin: 0 }} />

            <ScrollerThin
                style={{
                    flex: 1,
                    background: "var(--background-surface-high)"
                }}
            >
                {query.length === 0 && (
                    <Flex style={{ width: "100%", height: "100%" }} justifyContent="center" alignItems="center">
                        <BaseText style={{ opacity: 0.5 }}>Start typing! ヽ(・∀・)ﾉ</BaseText>
                    </Flex>
                )}
                {results.length > 0 && (
                    <Grid columns={2} gap="8px" style={{ padding: "12px" }}>
                        {results.map(({ text, subcategory }) => (
                            <Button
                                key={text + subcategory}
                                size="medium"
                                onClick={() => {
                                    onPick();
                                    insertTextIntoChatInputBox(text);
                                    setCurrent(null);
                                }}
                                onMouseEnter={() => setCurrent(text)}
                                onMouseLeave={() => setCurrent(null)}
                            >
                                {text}
                            </Button>
                        ))}
                    </Grid>
                )}
                {query.length > 0 && results.length === 0 && (
                    <Flex style={{ width: "100%", height: "100%" }} justifyContent="center" alignItems="center">
                        <BaseText style={{ opacity: 0.5 }}>No results ಥ_ಥ</BaseText>
                    </Flex>
                )}
            </ScrollerThin>

            <Divider style={{ margin: 0 }} />

            <Flex style={{ height: "48px", width: "100%", background: "var(--background-base-lower)" }} justifyContent="center" alignItems="center">
                <BaseText>{results.length !== 0 && current}</BaseText>
            </Flex>
        </Card>
    );
};

const KaomojiButton: ChatBarButtonFactory = ({ isMainChat }) => {
    if (!isMainChat) return null;

    const buttonRef = useRef<HTMLSpanElement>(null);
    const [show, setShow] = useState<boolean>(false);

    return (
        <Popout
            position="top"
            align="center"
            animation={Popout.Animation.NONE}
            shouldShow={show}
            spacing={8}
            onRequestClose={() => setShow(false)}
            targetElementRef={buttonRef}
            renderPopout={() => (
                <KaomojiPicker maxResultsCap={MAX_RESULTS_CAP} onPick={() => setShow(false)} />
            )}
        >
            {() => (
                <span ref={buttonRef}>
                    <ChatBarButton
                        tooltip="Open Kaomoji Picker"
                        onClick={() => setShow(!show)}
                        buttonProps={{
                            "aria-haspopup": "dialog"
                        }}
                    >
                        {"Kao"}
                    </ChatBarButton>
                </span>
            )}
        </Popout>
    );
};

export default definePlugin({
    name: "KaomojiPicker",
    authors: [Devs.flyingmisaki],
    description: "Adds a Kaomoji picker to the chat bar.",
    chatBarButton: {
        render: KaomojiButton,
        icon: () => "Kao"
    }
});
