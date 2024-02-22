import {CloseIcon, DocumentVideoIcon, UploadIcon} from '@sanity/icons'
import {
  Button,
  Card,
  Checkbox,
  Dialog,
  Flex,
  Grid,
  Label,
  Radio,
  Stack,
  Text,
  TextInput,
} from '@sanity/ui'
import {useId} from 'react'
import formatBytes from '../util/formatBytes'
import {ENCODING_TIERS, PluginConfig, Secrets, UploadConfig, type StagedUpload} from '../util/types'
import FormField from './FormField'
import TextTracksEditor from './TextTracksEditor'

export default function UploadConfiguration({
  secrets,
  pluginConfig,
  uploadConfig: config,
  setUploadConfig,
  startUpload,
  cancelUpload,
  stagedUpload,
}: {
  secrets: Secrets
  uploadConfig: UploadConfig
  setUploadConfig: (newConfig: UploadConfig) => void
  pluginConfig: PluginConfig
  startUpload: () => void
  cancelUpload: () => void
  stagedUpload: StagedUpload
}) {
  const id = useId()

  function modifyProperty(newValues: Partial<UploadConfig>) {
    setUploadConfig({
      ...config,
      ...newValues,
    })
  }

  const filenameId = `${id}--filename`
  return (
    <Dialog
      open
      onClose={cancelUpload}
      id="upload-configuration"
      zOffset={1000}
      width={4}
      header="Configure upload"
      footer={
        <Card padding={3}>
          <Flex justify="flex-end" align="center" gap={3}>
            <Button text="Cancel" icon={CloseIcon} onClick={cancelUpload} mode="bleed" />
            <Button
              icon={UploadIcon}
              text="Upload"
              tone="positive"
              disabled={!config.filename}
              onClick={startUpload}
            />
          </Flex>
        </Card>
      }
    >
      <Stack space={4} paddingY={2} paddingX={4} as="form">
        <Label size={3}>FILE TO UPLOAD</Label>
        <Card
          tone="transparent"
          border
          padding={3}
          paddingY={4}
          style={{borderRadius: '0.1865rem'}}
        >
          <Flex gap={2}>
            <DocumentVideoIcon fontSize="2em" />
            <Stack space={2}>
              <Text textOverflow="ellipsis" as="h2" size={3}>
                {stagedUpload.type === 'file' ? stagedUpload.file.name : stagedUpload.url}
              </Text>
              <Text as="p" size={1} muted>
                {stagedUpload.type === 'file'
                  ? `Direct File Upload (${formatBytes(stagedUpload.file.size)})`
                  : 'File From URL (Unknown size)'}
              </Text>
            </Stack>
          </Flex>
        </Card>
        <FormField title="Video title" inputId={filenameId}>
          <TextInput
            id={filenameId}
            onChange={(e) => modifyProperty({filename: e.currentTarget.value})}
            type="text"
            value={config.filename || ''}
            tabIndex={0}
          />
        </FormField>
        {secrets.enableSignedUrls && (
          <Flex align="center" gap={2}>
            <Checkbox
              id={`${id}--signed`}
              style={{display: 'block'}}
              name="signed"
              required
              checked={config.signed}
              onChange={(e) => {
                modifyProperty({
                  signed: e.currentTarget.checked,
                })
              }}
            />
            <Text>
              <label htmlFor={`${id}--signed`}>Signed playback URL</label>
            </Text>
          </Flex>
        )}

        <Grid gap={4} style={{position: 'relative', alignItems: 'flex-start'}} columns={[1, 2]}>
          <fieldset style={{all: 'unset', position: 'sticky', top: '1rem'}}>
            <Stack space={2}>
              <Text as="legend" size={1} weight="semibold">
                Encoding tier
              </Text>
              {ENCODING_TIERS.map(({value, label}) => {
                const inputId = `${id}--encoding_tier-${value}`

                return (
                  <Flex key={value} align="center" gap={2}>
                    <Radio
                      checked={config.encoding_tier === value}
                      name="encoding_tier"
                      onChange={(e) => {
                        modifyProperty({
                          encoding_tier: e.currentTarget.value as UploadConfig['encoding_tier'],
                        })
                      }}
                      value={value}
                      id={inputId}
                    />
                    <Text as="label" htmlFor={inputId}>
                      {label}
                    </Text>
                  </Flex>
                )
              })}
            </Stack>
          </fieldset>
          {config.encoding_tier === 'smart' && (
            <Stack space={4} style={{position: 'sticky', top: '1rem'}}>
              {pluginConfig.max_resolution_tier !== '1080p' && (
                <fieldset style={{all: 'unset'}}>
                  <Stack space={2}>
                    <Text as="legend" size={1} weight="semibold">
                      Max resolution
                    </Text>
                    {getResolutionOptions(pluginConfig).map(({value, label}) => {
                      const inputId = `${id}--max_resolution-${value}`
                      return (
                        <Flex key={value} align="center" gap={2}>
                          <Radio
                            checked={config.max_resolution_tier === value}
                            name="max_resolution"
                            onChange={(e) => {
                              modifyProperty({
                                max_resolution_tier: e.currentTarget
                                  .value as UploadConfig['max_resolution_tier'],
                              })
                            }}
                            value={value}
                            id={inputId}
                          />
                          <Text as="label" htmlFor={inputId}>
                            {label}
                          </Text>
                        </Flex>
                      )
                    })}
                  </Stack>
                </fieldset>
              )}

              {pluginConfig.mp4_support !== 'none' && (
                <Flex align="center" gap={2}>
                  <Checkbox
                    id={`${id}--mp4_support`}
                    style={{display: 'block'}}
                    name="mp4_support"
                    required
                    checked={config.mp4_support === 'standard'}
                    onChange={(e) => {
                      modifyProperty({
                        mp4_support: e.currentTarget.checked ? 'standard' : 'none',
                      })
                    }}
                  />
                  <Text>
                    <label htmlFor={`${id}--mp4_support`}>MP4 support (allow downloading)</label>
                  </Text>
                </Flex>
              )}
            </Stack>
          )}
        </Grid>

        <TextTracksEditor
          tracks={config.text_tracks || []}
          setTracks={(newTracks) => {
            modifyProperty({
              text_tracks: newTracks as UploadConfig['text_tracks'],
            })
          }}
        />
      </Stack>
    </Dialog>
  )
}

function getResolutionOptions({max_resolution_tier}: PluginConfig) {
  return [
    {value: '1080p', label: '1080p'},
    max_resolution_tier !== '1080p' && {value: '1440p', label: '1440p (2k)'},
    max_resolution_tier !== '1080p' &&
      max_resolution_tier !== '1440p' && {value: '2160p', label: '2160p (4k)'},
  ].filter(Boolean) as {value: PluginConfig['max_resolution_tier']; label: string}[]
}
