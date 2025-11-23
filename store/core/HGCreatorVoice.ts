import { HGCreatorBrain } from "./HGCreatorBrain";

export const HGCreatorVoice = {
  start() {
    if (!('webkitSpeechRecognition' in window)) {
        console.warn("Web Speech API not supported");
        return;
    }
    // @ts-ignore
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "es-MX";
    recognition.continuous = false;

    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      const parsed = HGCreatorBrain.parseVoiceCommand(text);
      await HGCreatorBrain.createFurniture({
        ...parsed,
        prompt: text,
        label: `Voz: ${parsed.category}`,
      });
    };

    recognition.start();
  },
};