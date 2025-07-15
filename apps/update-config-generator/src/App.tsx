import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  parseUpdateConfig,
  type ChannelName,
  type UpdateConfig,
  type UpdateManifestChannelVersionBuild
} from '@slimevr/update-manifest-shared';
import { DownloadIcon, InfoIcon, Trash2Icon, UploadIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

const InlineCode = ({ children }: { children: React.ReactNode }) => (
  <span className="font-mono bg-muted px-1 py-0.5 rounded text-foreground">{children}</span>
);

export const App = () => {
  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');
  // { [platform]: { [architecture]: { url: string; run: string[] }} }
  const [overrides, setOverrides] = useState<Record<string, Record<string, UpdateManifestChannelVersionBuild>>>({});
  const [platform, setPlatform] = useState('');
  const [arch, setArch] = useState('');
  const [url, setUrl] = useState('');
  const [run, setRun] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const generated: UpdateConfig = {
    channel: {
      name: channelName as ChannelName,
      description: channelDescription || undefined
    },
    overrides
  };

  const addOverride = () => {
    if (!platform || !arch || !url) return;

    setOverrides((prev) => {
      const newOverrides = { ...prev };
      if (!newOverrides[platform]) {
        newOverrides[platform] = {};
      }
      newOverrides[platform][arch] = {
        url,
        run: run.split(/\s+/).filter(Boolean)
      };
      return newOverrides;
    });

    setPlatform('');
    setArch('');
    setUrl('');
    setRun('');
  };

  const removeOverride = (platform: string, arch: string) => {
    setOverrides((prev) => {
      const newOverrides = { ...prev };
      if (newOverrides[platform]) {
        delete newOverrides[platform][arch];
        if (Object.keys(newOverrides[platform]).length === 0) {
          delete newOverrides[platform];
        }
      }
      return newOverrides;
    });
  };

  const clearOverrides = () => {
    setOverrides({});
  };

  const download = () => {
    if (!generated) return;
    try {
      const blob = new Blob([JSON.stringify(generated, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'update-config.json';
      link.click();

      toast.success('Downloaded update config');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error('Cannot download invalid config: ' + error.message);
      } else {
        toast.error('Cannot download invalid config');
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;

        try {
          const config = parseUpdateConfig(JSON.parse(content));
          setChannelName(config.channel.name);
          setChannelDescription(config.channel.description || '');
          setOverrides(config.overrides);

          toast.success('Loaded update config');
        } catch (error: unknown) {
          if (error instanceof Error) {
            toast.error('Invalid config file: ' + error.message);
          } else {
            toast.error('Invalid config file');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Update Config Generator</h1>
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                <UploadIcon className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Load Config</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={download} disabled={!channelName}>
                <DownloadIcon className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save Config</TooltipContent>
          </Tooltip>
        </div>
        <Input type="file" accept=".json" onChange={handleFileUpload} className="hidden" ref={fileInputRef} />
      </div>
      <Input
        placeholder="Channel Name"
        type="text"
        value={channelName}
        onChange={(e) => setChannelName(e.target.value)}
        className="mb-2"
      />
      <Textarea
        placeholder="Channel Description"
        value={channelDescription}
        onChange={(e) => setChannelDescription(e.target.value)}
        className="mb-4"
      />
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-xl font-semibold">Overrides</h2>
        <Button
          size="icon"
          variant="destructive"
          onClick={clearOverrides}
          disabled={Object.keys(overrides).length === 0}
        >
          <Trash2Icon className="w-4 h-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Add New Override</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Input placeholder="Platform (e.g. windows)" value={platform} onChange={(e) => setPlatform(e.target.value)} />
              <Input placeholder="Architecture (e.g. x86_64)" value={arch} onChange={(e) => setArch(e.target.value)} />
              <Input placeholder="URL (can use $VERSION$)" value={url} onChange={(e) => setUrl(e.target.value)} />
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Run command (space separated)"
                  value={run}
                  onChange={(e) => setRun(e.target.value)}
                  className="flex-1"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="w-5 h-5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Available placeholders:</p>
                    <p className="leading-5">
                      <InlineCode>$VERSION$</InlineCode>: the Git tag
                    </p>
                    <p className="leading-5">
                      <InlineCode>$_BINARY_$</InlineCode>: the path to the binary
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={addOverride}>Add</Button>
          </CardFooter>
        </Card>
        {Object.entries(overrides).flatMap(([platform, archs]) =>
          Object.entries(archs).map(([architecture, build]) => (
            <Card key={`${platform}-${architecture}`}>
              <CardHeader>
                <CardTitle>{platform} - {architecture}</CardTitle>
              </CardHeader>
              <CardContent className='flex-1'>
                <p><strong>URL:</strong> {build.url}</p>
                <p><strong>Run:</strong> <InlineCode>{build.run.join(' ')}</InlineCode></p>
              </CardContent>
              <CardFooter>
                <Button variant="destructive" onClick={() => removeOverride(platform, architecture)}>Remove</Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default App;
