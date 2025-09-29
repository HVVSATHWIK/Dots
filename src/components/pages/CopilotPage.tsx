import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image as Img } from '@/components/ui/image';
import { Wand2, Mic, Square, Upload, Loader2, Share2, Download, ImagePlus, ShieldCheck, AlertTriangle, Bug } from 'lucide-react';
import { generateListingPack, generateDesignVariations } from '@/integrations/ai';
import type { ListingPack, DesignVariationResult } from '@/integrations/ai/types';
import { mintBirthCertificate } from '@/integrations/trust';
import type { BirthCertificate } from '@/integrations/trust/types';
import { useMember } from '@/integrations';
import { saveListingPack } from '@/integrations/members/listing-store';

let defaultPhotoTheme = '';
try {
  // @ts-ignore
  defaultPhotoTheme = await import('/photo-theme.txt?raw').then(m => m.default as string).catch(() => '');
} catch {}

export default function CopilotPage() {
  const { user } = useMember();
  const [images, setImages] = useState<File[]>([]);
  const [voiceNote, setVoiceNote] = useState<File | null>(null);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [languages, setLanguages] = useState<string[]>(['en', 'hi']);
  const [photoTheme, setPhotoTheme] = useState(defaultPhotoTheme || 'Clean background, natural light, mobile-first square crops.');

  const [isGenerating, setIsGenerating] = useState(false);
  const [pack, setPack] = useState<ListingPack | null>(null);

  const [designPrompt, setDesignPrompt] = useState('Generate 4 modern variations keeping core motif intact');
  const [designs, setDesigns] = useState<DesignVariationResult | null>(null);
  const [isVarying, setIsVarying] = useState(false);

  const [isMinting, setIsMinting] = useState(false);
  const [certificate, setCertificate] = useState<BirthCertificate | null>(null);

  const onPickImages = (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    
    // Validate each file
    const validFiles: File[] = [];
    for (const file of fileArray) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file. Please select only images (JPG, PNG, GIF, WebP).`);
        continue;
      }
      
      // Check file size (max 20MB for listing generation)
      const maxSize = 20 * 1024 * 1024; // 20MB
      if (file.size > maxSize) {
        alert(`${file.name} is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Please choose images under 20MB.`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    if (validFiles.length === 0) return;
    
    setImages(prev => {
      const newImages = [...prev, ...validFiles];
      // Limit to 5 images total
      if (newImages.length > 5) {
        alert(`You can only upload up to 5 images. Only the first 5 will be kept.`);
        return newImages.slice(0, 5);
      }
      return newImages;
    });
  };
  const onPickVoice = (file: File | null) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('audio/')) {
      alert(`${file.name} is not an audio file. Please select audio files (MP3, WAV, M4A, WebM, etc.).`);
      return;
    }
    
    // Check file size (max 50MB for audio)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      alert(`${file.name} is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Please choose audio files under 50MB.`);
      return;
    }
    
    // Check duration if possible (approximate based on file size)
    const estimatedDurationMinutes = file.size / (128 * 1024 / 8) / 60; // Estimate for 128kbps audio
    if (estimatedDurationMinutes > 10) {
      if (!confirm(`This audio file appears to be quite long (~${estimatedDurationMinutes.toFixed(1)} minutes). Voice notes work best when kept under 2-3 minutes. Continue anyway?`)) {
        return;
      }
    }
    
    setVoiceNote(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      const chunks: BlobPart[] = [];
      mr.ondataavailable = e => chunks.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setVoiceNote(new File([blob], 'voice-note.webm', { type: blob.type }));
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      setRecording(true);
    } catch {
      alert('Recording not supported. Please upload an audio file.');
    }
  };
  const stopRecording = () => { mediaRecorderRef.current?.stop(); setRecording(false); };

  const doGenerate = async () => {
    if (!images.length) return alert('Add at least 1 image.');
    if (!voiceNote) return alert('Add or record a short voice note.');
    setIsGenerating(true); setPack(null);
    try {
      const res = await generateListingPack({ images, voiceNote, languages, photoTheme });
      setPack(res);
      if (user?.uid) {
        try { await saveListingPack(user.uid, res); } catch (e) { console.warn('Save failed', e); }
      }
    } catch (e) { console.error(e); alert('Generation failed.'); }
    finally { setIsGenerating(false); }
  };

  const doVary = async () => {
    if (!images.length) return alert('Add at least 1 base image.');
    setIsVarying(true); setDesigns(null);
    try { setDesigns(await generateDesignVariations({ baseImage: images[0], prompt: designPrompt })); }
    catch (e) { console.error(e); alert('Variation failed.'); }
    finally { setIsVarying(false); }
  };

  const doMint = async () => {
    if (!pack) return alert('Generate a listing first.');
    setIsMinting(true); setCertificate(null);
    try {
      const res = await mintBirthCertificate({
        title: pack.title.en,
        artisanName: pack.meta.artisanName,
        images: pack.assets.cleanedImages,
        rawEvidence: { voiceNote, workInProgress: images.slice(0, 2) },
      });
      setCertificate(res);
    } catch (e) { console.error(e); alert('Minting failed.'); }
    finally { setIsMinting(false); }
  };

  const whatsapp = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-primary uppercase tracking-wide">Listing Copilot</h1>
            <p className="font-paragraph text-primary/70">Assistant, Collaborator, and Guardian for artisan listings.</p>
          </div>
          <Button asChild variant="outline"><Link to="/sell">Back to Seller</Link></Button>
        </div>

        <Tabs defaultValue="assistant">
          <TabsList className="mb-6">
            <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
            <TabsTrigger value="collaborator">AI Collaborator</TabsTrigger>
            <TabsTrigger value="guardian">AI Guardian</TabsTrigger>
          </TabsList>

          <TabsContent value="assistant" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-0">
                <CardHeader><CardTitle className="font-heading text-xl text-primary">Inputs</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="font-paragraph font-medium text-primary mb-2 block">Product Photos (up to 5)</label>
                    <Input type="file" accept="image/*" multiple onChange={e => onPickImages(e.target.files)} />
                    {images.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                        {images.map((f, i) => (
                          <Img key={i} src={URL.createObjectURL(f)} alt={`img-${i}`} width={160} className="w-full h-28 object-cover rounded" />
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="font-paragraph font-medium text-primary mb-2 block">Voice Note (30–60s)</label>
                    <div className="flex flex-wrap gap-3 items-center">
                      {!recording ? (
                        <Button onClick={startRecording} className="bg-neonaccent text-primary"><Mic className="w-4 h-4 mr-2" />Record</Button>
                      ) : (
                        <Button onClick={stopRecording} variant="destructive"><Square className="w-4 h-4 mr-2" />Stop</Button>
                      )}
                      <label className="inline-flex items-center gap-2">
                        <Upload className="w-4 h-4 text-primary" />
                        <Input type="file" accept="audio/*" onChange={e => onPickVoice(e.target.files?.[0] ?? null)} />
                      </label>
                      {voiceNote && <Badge variant="outline" className="truncate max-w-[220px]">{voiceNote.name}</Badge>}
                    </div>
                  </div>

                  <div>
                    <label className="font-paragraph font-medium text-primary mb-2 block">Photo Theme Prompt</label>
                    <Textarea rows={3} value={photoTheme} onChange={e => setPhotoTheme(e.target.value)} />
                  </div>

                  <div>
                    <label className="font-paragraph font-medium text-primary mb-2 block">Languages</label>
                    <div className="flex gap-4">
                      {['en','hi','bn','ta'].map(l => (
                        <label key={l} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={languages.includes(l)}
                            onChange={(e) => {
                              const next = e.target.checked ? [...new Set([...languages, l])] : languages.filter(x => x !== l);
                              setLanguages(next);
                            }}
                          />
                          {l.toUpperCase()}
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button disabled={isGenerating} onClick={doGenerate} className="bg-primary text-primary-foreground">
                    {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</> : <><Wand2 className="w-4 h-4 mr-2" />Generate Listing Pack</>}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0">
                <CardHeader><CardTitle className="font-heading text-xl text-primary">Output</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {!pack && <p className="font-paragraph text-primary/60">Generate to see results.</p>}
                  {pack && (
                    <>
                      {pack.assets.poster && (
                        <div>
                          <Img src={pack.assets.poster} alt="Poster" width={300} className="w-full h-44 object-cover rounded" />
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" asChild variant="outline"><a href={pack.assets.poster} target="_blank" rel="noreferrer"><Download className="w-4 h-4 mr-2" />Download Poster</a></Button>
                            <Button size="sm" asChild variant="outline"><a href={pack.assets.poster} target="_blank" rel="noreferrer"><Share2 className="w-4 h-4 mr-2" />Open</a></Button>
                          </div>
                        </div>
                      )}

                      <div>
                        <h3 className="font-heading font-bold text-primary text-lg mb-1">Titles</h3>
                        <p className="font-paragraph text-primary">{pack.title.en}</p>
                        {pack.title.hi && <p className="font-paragraph text-primary">{pack.title.hi}</p>}
                      </div>

                      <div>
                        <h3 className="font-heading font-bold text-primary text-lg mb-1">Descriptions</h3>
                        <Textarea readOnly value={[pack.description.en, pack.description.hi].filter(Boolean).join('\n\n')} />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {pack.tags.map(t => <Badge key={t} variant="secondary" className="bg-neonaccent text-primary">{t}</Badge>)}
                      </div>

                      <div>
                        <h3 className="font-heading font-bold text-primary text-lg mb-1">Price Suggestion</h3>
                        <p className="font-paragraph text-primary">₹{pack.price.min.toLocaleString()}–₹{pack.price.max.toLocaleString()}</p>
                        <p className="font-paragraph text-xs text-primary/60">{pack.price.rationale}</p>
                      </div>

                      <div className="space-y-2">
                        <Button asChild variant="outline" size="sm"><a href={whatsapp(pack.social.caption.en)} target="_blank" rel="noreferrer"><Share2 className="w-4 h-4 mr-2" />Share EN</a></Button>
                        {pack.social.caption.hi && <Button asChild variant="outline" size="sm"><a href={whatsapp(pack.social.caption.hi)} target="_blank" rel="noreferrer"><Share2 className="w-4 h-4 mr-2" />Share HI</a></Button>}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
            <p className="text-sm text-primary/60">Tip: Use the assistant bubble at the bottom-right anywhere in DOTS.</p>
          </TabsContent>

          <TabsContent value="collaborator" className="space-y-6">
            <Card className="border-0">
              <CardHeader><CardTitle className="font-heading text-xl text-primary">Generative Design Variations</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div>
                      <label className="font-paragraph font-medium text-primary mb-2 block">Base Image (motif/product)</label>
                      <Input type="file" accept="image/*" onChange={e => onPickImages(e.target.files)} />
                    </div>
                    <div>
                      <label className="font-paragraph font-medium text-primary mb-2 block">Variation Prompt</label>
                      <Textarea rows={3} value={designPrompt} onChange={e => setDesignPrompt(e.target.value)} />
                    </div>
                    <Button disabled={isVarying} onClick={doVary}>
                      {isVarying ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</> : <><ImagePlus className="w-4 h-4 mr-2" />Generate Variations</>}
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {!designs && <p className="font-paragraph text-primary/60">No variations yet.</p>}
                    {designs && (
                      <>
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          {designs.model && <Badge variant="outline">model: {designs.model}</Badge>}
                          {designs.fallback && <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" />fallback</Badge>}
                          {designs.override && <Badge variant="secondary">override</Badge>}
                          {designs.cachedRouter && <Badge variant="secondary">router-cached</Badge>}
                          {designs.note && <span className="text-primary/60 truncate max-w-[200px]">{designs.note}</span>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {designs.variations.map((url, i) => {
                            const isData = url.startsWith('data:');
                            const stub = !isData && /static\.wixstatic\.com\/media/.test(url);
                            return (
                              <div key={i} className="relative group">
                                <Img src={url} alt={`variation-${i}`} width={180} className="w-full h-28 object-cover rounded ring-1 ring-border" />
                                {stub && <span className="absolute top-1 left-1 bg-black/60 text-[10px] text-white px-1 rounded">stub</span>}
                                {isData && <span className="absolute top-1 left-1 bg-green-600/70 text-[10px] text-white px-1 rounded">gen</span>}
                              </div>
                            );
                          })}
                        </div>
                        {designs.attempts && designs.attempts.length > 0 && (
                          <details className="mt-2 text-xs">
                            <summary className="cursor-pointer flex items-center gap-1"><Bug className="w-3 h-3" />Attempts</summary>
                            <ul className="mt-1 space-y-1">
                              {designs.attempts.map((a, i) => (
                                <li key={i} className="font-mono break-all">
                                  {a.model ? a.model + ': ' : ''}{a.ok ? 'ok' : 'fail'}{a.via ? ' via ' + a.via : ''}{a.error ? ' – ' + a.error : ''}
                                </li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guardian" className="space-y-6">
            <Card className="border-0">
              <CardHeader><CardTitle className="font-heading text-xl text-primary">Digital Birth Certificate</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="font-paragraph text-primary/70">Mint a verifiable credential (NFT) with geotag, timestamps, and raw evidence.</p>
                <Button disabled={isMinting || !pack} onClick={doMint} className="bg-primary text-primary-foreground">
                  {isMinting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Minting…</> : <><ShieldCheck className="w-4 h-4 mr-2" />Mint Birth Certificate</>}
                </Button>

                {!certificate && <p className="font-paragraph text-primary/60">No certificate yet.</p>}
                {certificate && (
                  <div className="space-y-2">
                    <p className="font-paragraph text-primary">Token ID: {certificate.tokenId}</p>
                    <p className="font-paragraph text-primary">QR: <a className="text-neonaccent underline" href={certificate.qrUrl} target="_blank" rel="noreferrer">{certificate.qrUrl}</a></p>
                    <p className="font-paragraph text-primary">Explorer: <a className="text-neonaccent underline" href={certificate.explorerUrl} target="_blank" rel="noreferrer">{certificate.explorerUrl}</a></p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
