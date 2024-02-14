import type {
  ObjectDefinition,
  ObjectInputProps,
  PreviewLayoutKey,
  PreviewProps,
  SanityDocument,
  SchemaType,
} from 'sanity'
import type {PartialDeep} from 'type-fest'

export interface MuxInputConfig {
  /**
   * Enable static renditions by setting this to 'standard'. Can be overwritten on a per-asset basis.
   * Requires `"encoding_tier": "smart"`
   * @see {@link https://docs.mux.com/guides/video/enable-static-mp4-renditions#why-enable-mp4-support}
   * @defaultValue 'none'
   */
  mp4_support: MuxNewAssetSettings['mp4_support']

  /**
   * Max resolution tier can be used to control the maximum resolution_tier your asset is encoded, stored, and streamed at.
   * Requires `"encoding_tier": "smart"`
   * @see {@link https://docs.mux.com/guides/stream-videos-in-4k}
   * @defaultValue '1080p'
   */
  max_resolution_tier: MuxNewAssetSettings['max_resolution_tier']

  /**
   * The encoding tier informs the cost, quality, and available platform features for the asset.
   * @see {@link https://docs.mux.com/guides/use-encoding-tiers}
   * @defaultValue 'smart'
   */
  encoding_tier: MuxNewAssetSettings['encoding_tier']

  /**
   * Normalize the audio track loudness level.
   * @see {@link https://docs.mux.com/guides/adjust-audio-levels#how-to-turn-on-audio-normalization}
   * @defaultValue false
   */
  normalize_audio: MuxNewAssetSettings['normalize_audio']

  /**
   * Enables signed URLs by default, if you configured them with your API token.
   * @see {@link https://docs.mux.com/guides/secure-video-playback}
   * @defaultValue false
   */
  defaultSigned?: boolean

  /**
   * Auto-generate captions for these languages by default.
   * Requires `"encoding_tier": "smart"`
   *
   * @see {@link https://docs.mux.com/guides/secure-video-playback}
   * @defaultValue false
   */
  defaultAutogeneratedSubtitleLangs?: SupportedMuxLanguage[]

  /**
   * Whether or not to allow content editors to override asset upload
   * configuration settings when uploading a video to Mux.
   *
   * @see {@link https://docs.mux.com/guides/secure-video-playback}
   * @defaultValue false
   */
  disableUploadConfig?: boolean

  /**
   * Whether or not to allow content editors to add text tracks alongside their
   * asset when uploading a video to Mux.
   *
   * @see {@link https://docs.mux.com/guides/secure-video-playback}
   * @defaultValue false
   */
  disableTextTrackConfig?: boolean
}

export interface PluginConfig extends MuxInputConfig {
  /**
   * How the videos browser should appear as a studio tool in Sanity's top navigation
   *
   * Pass `false` if you want to disable it.
   * @defaultValue {title: 'Videos', icon: VideoIcon}
   **/
  tool:
    | false
    | {
        title?: string
        icon?: React.ComponentType
      }
}

export const SUPPORTED_MUX_LANGUAGES = [
  {label: 'English', code: 'en', state: 'Stable'},
  {label: 'Spanish', code: 'es', state: 'Stable'},
  {label: 'Italian', code: 'it', state: 'Stable'},
  {label: 'Portuguese', code: 'pt', state: 'Stable'},
  {label: 'German', code: 'de', state: 'Stable'},
  {label: 'French', code: 'fr', state: 'Stable'},
  {label: 'Polish', code: 'pl', state: 'Beta'},
  {label: 'Russian', code: 'ru', state: 'Beta'},
  {label: 'Dutch', code: 'nl', state: 'Beta'},
  {label: 'Catalan', code: 'ca', state: 'Beta'},
  {label: 'Turkish', code: 'tr', state: 'Beta'},
  {label: 'Swedish', code: 'sv', state: 'Beta'},
  {label: 'Ukrainian', code: 'uk', state: 'Beta'},
  {label: 'Norwegian', code: 'no', state: 'Beta'},
  {label: 'Finnish', code: 'fi', state: 'Beta'},
  {label: 'Slovak', code: 'sk', state: 'Beta'},
  {label: 'Greek', code: 'el', state: 'Beta'},
  {label: 'Czech', code: 'cs', state: 'Beta'},
  {label: 'Croatian', code: 'hr', state: 'Beta'},
  {label: 'Danish', code: 'da', state: 'Beta'},
  {label: 'Romanian', code: 'ro', state: 'Beta'},
  {label: 'Bulgarian', code: 'bg', state: 'Beta'},
] as const

export const SUPPORTED_MUX_LANGUAGES_VALUES = SUPPORTED_MUX_LANGUAGES.map((l) => l.code)

export type SupportedMuxLanguage = (typeof SUPPORTED_MUX_LANGUAGES_VALUES)[number]

export interface TextTrack {
  _id: string
  name: string
}

export interface AutogeneratedTextTrack extends TextTrack {
  type: 'autogenerated'
  language_code: SupportedMuxLanguage
}

export interface CustomTextTrack extends TextTrack {
  type: 'subtitles' | 'captions'
  language_code: string
  file: {
    contents: string
    type: string
    name: string
    size: number
  }
}

export function isCustomTextTrack(track: Partial<UploadTextTrack>): track is CustomTextTrack {
  return track.type !== 'autogenerated'
}

export function isAutogeneratedTrack(
  track: Partial<UploadTextTrack>
): track is AutogeneratedTextTrack {
  return track.type === 'autogenerated'
}

export type UploadTextTrack = AutogeneratedTextTrack | CustomTextTrack

export interface UploadConfig
  extends Pick<
    MuxInputConfig,
    'encoding_tier' | 'max_resolution_tier' | 'mp4_support' | 'normalize_audio'
  > {
  text_tracks: UploadTextTrack[]
  signed: boolean
}

// Typings lifted from https://docs.mux.com/api-reference#video/operation/create-direct-upload
export interface MuxNewAssetSettings {
  /** An array of objects that each describe an input file to be used to create the asset.*/
  input?: {
    /** The URL of the file that Mux should download and use. */
    url?: string
    /** Generate subtitle tracks using automatic speech recognition with this configuration. This may only be provided for the first input object (the main input file).  */
    generated_subtitles?: {
      /** A name for this subtitle track. */
      name: string
      /** Arbitrary metadata set for the subtitle track. Max 255 characters. */
      passthrough?: string
      /** The language to generate subtitles in. */
      language_code: SupportedMuxLanguage
    }[]
    /** The time offset in seconds from the beginning of the video indicating the clip's starting marker. */
    start_time?: number
    /** The time offset in seconds from the beginning of the video indicating the clip's ending marker. */
    end_time?: number
    /** This parameter is required for text type tracks. */
    type: 'video' | 'audio' | 'text'
    /** Type of text track. This parameter only supports subtitles value. */
    text_type?: 'subtitles'
    /** The language code value must be a valid BCP 47 specification compliant value. */
    language_code?: string
    /** The name of the track containing a human-readable description. This value must be unique within each group of text or audio track types. */
    name?: string
    /** Indicates the track provides Subtitles for the Deaf or Hard-of-hearing (SDH). */
    closed_captions?: boolean
    /// @TODO Huhh?>?? Below
    /** This optional parameter should be used tracks with type of text and text_type set to subtitles. */
    passthrough?: string
  }[]
  /** An array of playback policy names that you want applied to this asset and available through playback_ids. */
  playback_policy: ('public' | 'signed')[]
  /** Arbitrary user-supplied metadata that will be included in the asset details and related webhooks.  */
  passthrough?: string
  /** Specify what level (if any) of support for mp4 playback. */
  mp4_support: 'none' | 'standard'
  /** Normalize the audio track loudness level. */
  normalize_audio: boolean
  /** Max resolution tier can be used to control the maximum resolution_tier your asset is encoded, stored, and streamed at. If not set, this defaults to 1080p. */
  max_resolution_tier: '1080p' | '1440p' | '2160p'
  /** The encoding tier informs the cost, quality, and available platform features for the asset. By default the smart encoding tier is used. */
  encoding_tier: 'smart' | 'baseline'
}

export interface Secrets {
  token: string | null
  secretKey: string | null
  enableSignedUrls: boolean
  signingKeyId: string | null
  signingKeyPrivate: string | null
}

// This narrowed type indicates that there may be assets that are signed, and we have the secrets to access them
// enabledSignedUrls might be false but that's only relevant for future uploads and their playback policy
export interface SignableSecrets extends Omit<Secrets, 'signingKeyId' | 'signingKeyPrivate'> {
  signingKeyId: string
  signingKeyPrivate: string
}

export type MuxImageOrigin = `https://image.mux.com`
export type MuxThumbnailUrl = `${MuxImageOrigin}/${string}/thumbnail.png?${string}`
export type MuxAnimatedThumbnailUrl = `${MuxImageOrigin}/${string}/animated.gif?${string}`
export type MuxStoryboardUrl = `${MuxImageOrigin}/${string}/storyboard.vtt?${string}`
export type MuxVideoOrigin = `https://stream.mux.com`
export type MuxVideoUrl = `${MuxVideoOrigin}/${string}.m3u8?${string}`
export type MuxApiUrl = MuxThumbnailUrl | MuxAnimatedThumbnailUrl | MuxStoryboardUrl | MuxVideoUrl

// 'preserve' by default
// @url: https://docs.mux.com/guides/video/get-images-from-a-video#thumbnail-query-string-parameters
export type FitMode = 'preserve' | 'crop' | 'smartcrop' | 'pad'

export interface ThumbnailOptions {
  fit_mode?: FitMode
  height?: number
  time?: number
  width?: number
}

export interface AnimatedThumbnailOptions {
  // Starting time code for the animation, if no end is set it'll have a 5s duration
  // The start and end timecodes uses `asset.thumbTime` to create an iOS `Live Photo` effect by showing you the 5 secodnds before, and after, the thumb time`
  start?: number
  // End code, can't be longer than 10s after the start code
  end?: number
  // Max 640px, 320px by default
  width?: number
  // Preserves aspect ratio, like width, you can't set both the height and width, max 640
  height?: number
  // The fps is 15 by default, but can go up to 30
  fps?: number
}

export type PlaybackPolicy = 'signed' | 'public'

export interface MuxErrors {
  type: string
  messages: string[]
}

export interface MuxPlaybackId {
  id: string
  policy: PlaybackPolicy
}

export interface MuxVideoTrack {
  type: 'video'
  id: string
  max_width: number
  max_height: number
  // if the fps can't be reliably determined, this will be -1
  max_frame_rate: -1 | number
  // top-level duration is always set, while track level duration is not
  duration?: number
}
export interface MuxAudioTrack {
  type: 'audio'
  id: string
  duration?: number
  max_channels: number
  max_channel_layout: 'stereo' | string
}
export interface MuxTextTrack {
  type: 'text'
  id: string
  text_type?: 'subtitles'
  // https://docs.mux.com/api-reference/video#operation/list-assets:~:text=text%20type%20tracks.-,tracks%5B%5D.,text_source,-string
  text_source?: 'uploaded' | 'embedded' | 'generated_live' | 'generated_live_final'
  // BCP 47 language code
  language_code?: 'en' | 'en-US' | string
  // The name of the track containing a human-readable description. The hls manifest will associate a subtitle text track with this value
  name?: 'English' | string
  closed_captions?: boolean
  //  Max 255 characters
  passthrough?: string
  status: 'preparing' | 'ready' | 'errored'
}
export type MuxTrack = MuxVideoTrack | MuxAudioTrack
// Typings lifted from https://docs.mux.com/api-reference/video#tag/assets
export interface MuxAsset {
  id: string
  created_at: string
  status: 'preparing' | 'ready' | 'errored'
  duration: number
  max_stored_resolution: 'Audio only' | 'SD' | 'HD' | 'FHD' | 'UHD'
  // if the fps can't be reliably determined, this will be -1
  max_stored_frame_rate: -1 | number
  // The aspect ratio of the asset in the form of width:height, for example 16:9
  aspect_ratio: `${number}:${number}`
  playback_ids: MuxPlaybackId[]
  tracks: MuxTrack[]
  errors?: MuxErrors
  upload_id: string
  is_live?: boolean
  // We use passthrough to set the mux.videoAsset._id of the asset that originally uploaded the video
  passthrough: string
  live_stream_id?: string
  master?: {
    status: 'ready' | 'preparing' | 'errored'
    // Temporary URL to master MP4, expires after 24 hours
    url: string
  }
  master_access: 'temporary' | 'none'
  mp4_support: 'standard' | 'none'
  // Asset Identifier of the video used as the source for creating the clip.
  source_asset_id?: string
  // Normalize the audio track loudness level. This parameter is only applicable to on-demand (not live) assets., default false
  normalize_audio?: boolean
  // The object does not exist if no static renditions have been requested
  static_renditions?: {
    status: 'ready' | 'preparing' | 'disabled' | 'errored'
    files: {
      name: 'low.mp4' | 'medium.mp4' | 'high.mp4' | 'audio.m4a'
      ext: 'mp4' | 'm4a'
      height: number
      width: number
      bitrate: number
      filesize: number
    }[]
  }
  recording_times?: {
    started_at: string
    duration: number
    type: 'content' | 'slate'
  }[]
  // https://docs.mux.com/guides/video/minimize-processing-time
  non_standard_input_reasons?: {
    video_codec?: string
    audio_codec?: string
    video_gop_size?: 'high'
    video_frame_rate?: string
    video_resolution?: string
    video_bitrate?: 'high'
    pixel_aspect_ratio?: string
    video_edit_list?: 'non-standard'
    audio_edit_list?: 'non-standard'
    unexpected_media_file_parameters?: 'non-standard'
    test?: boolean
  }
}

export interface VideoAssetDocument extends SanityDocument {
  type?: 'mux.videoAsset'
  status?: string
  assetId?: string
  playbackId?: string
  filename?: string
  thumbTime?: number
  // Docs for what goes in `data` https://docs.mux.com/api-reference/video#tag/assets
  data?: PartialDeep<MuxAsset>
}

export type Reference = {_type: 'reference'; _ref: string}

// @TODO add Reference, and ReferenceSchemaType in the generic
export type MuxInputProps = ObjectInputProps<{
  asset?: Reference
}>

export interface MuxInputPreviewProps extends Omit<PreviewProps<PreviewLayoutKey>, 'value'> {
  schemaType: SchemaType
  value?: {
    asset?: Reference
  } | null
}

/** Whether the VideosBrowser was opened from a field in a document, or from the standalone studio tool */
export type PluginPlacement = 'input' | 'tool'
