import { ChannelType } from '@prisma/client';
import { AVAILABLE_MODELS } from '@/lib/config/models';
import { ChatFrequency } from '@/lib/config/chat-variables';
import * as z from 'zod';

// Validators

const passwordValidator = (password:string) => {
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return hasLowerCase && hasUpperCase && hasNumber && hasSymbol;
  };

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, {
        message: 'Password is Required'
    })
});

export const RegistrationSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, {
        message: 'Password requires at least 8 chars'
    })
    .refine(passwordValidator, {
        message: 'Password requires both lower and uppercase letters, at least one number, and a symbol'
    }),
    username: z.string().min(1, {
        message: 'You must enter a username'
    }),
    imageUrl: z.string().optional()
});

export const ResetPasswordSchema = z.object({
    currentPassword: z.string().min(1, {
        message: 'Current password is required'
    }),
    newPassword: z.string().min(8, {
        message: 'Password requires at least 8 chars'
    })
    .refine(passwordValidator, {
        message: 'Password requires both lower and uppercase letters, at least one number, and a symbol'
    }),
    confirmNewPassword: z.string().min(1, {
        message: 'Confirm new password is required'
    })
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"], // path of error
});

export const ChangeUsernameSchema = z.object({
    username: z.string().min(3, {
        message: "Username must be at least 3 characters."
    }).max(30, {
        message: "Username cannot exceed 30 characters."
    })
    // Optional: Add regex for allowed characters if needed, e.g. .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores." })
});

export const ChangeRealNameSchema = z.object({
    name: z.string().min(1, {
        message: "Name cannot be empty."
    }).max(50, {
        message: "Name cannot exceed 50 characters."
    })
});

export const ChangeStatusMessageSchema = z.object({
    statusMessage: z.string().max(200, { // Allow empty string, but limit max length
        message: "Status message cannot exceed 200 characters."
    }).optional() // Making it optional means an empty submission is fine
});

export const ServerSchema = z.object({
    name: z.string().min(1, {
        message: 'You need to name your server'
    }),
    imageUrl: z.string().min(1, {
        message: 'You need an image for your server'
    })
});

export const ChannelSchema = z.object({
    name: z.string().min(1, {
        message: 'You need to name your channel'
    }).refine(name => name !== 'general', {
        message: 'Channel name cannot be "general"'
    }),
    type: z.nativeEnum(ChannelType)
})

export const PersonalBotSchema = z.object({
    name: z.string().min(1, {
        message: 'You need to name your bot'
    }),
    profileDescription: z.string().min(1, {
        message: 'You need a profile description for your bot'
    }),
    systemPrompt: z.string().min(1, {
        message: 'You need to enter a prompt for your bot'
    }),
    imageUrl: z.string().min(1, {
        message: 'You need an image for your bot'
    }),
    model: z.string().refine((value) => value in AVAILABLE_MODELS, {
        message: 'Invalid model selected'
    })
})

export const BotTemplateSchema = z.object({
    name: z.string().min(1, {
        message: 'You need to name your bot'
    }),
    profileDescription: z.string().min(1, {
        message: 'You need a profile description for your bot'
    }),
    systemPrompt: z.string().min(1, {
        message: 'You need to enter a prompt for your bot'
    }),
    imageUrl: z.string().min(1, {
        message: 'You need an image for your bot'
    }),
    model: z.string().refine((value) => value in AVAILABLE_MODELS, {
        message: 'Invalid model selected'
    }),
    fullPromptControl: z.boolean(),
    chatFrequency: z.nativeEnum(ChatFrequency),
    parentBotConfigId: z.string().optional()
})
export const ServerBotSchema = z.object({
    name: z.string().min(1, {
        message: 'You need to name your bot'
    }),
    profileDescription: z.string().min(1, {
        message: 'You need a profile description for your bot'
    }),
    systemPrompt: z.string().min(1, {
        message: 'You need to enter a prompt for your bot'
    }),
    imageUrl: z.string().min(1, {
        message: 'You need an image for your bot'
    }),
    model: z.string().refine((value) => value in AVAILABLE_MODELS, {
        message: 'Invalid model selected'
    }),
    fullPromptControl: z.boolean(),
    chatFrequency: z.nativeEnum(ChatFrequency),
    ourApiKey: z.boolean()
})

export const MessageFileUploadSchema = z.object({
    fileUrl: z.string().min(1, {
        message: 'You need a valid filepath'
    })
})

export const ServerTemplateChannelSchema = z.object({
  name: z.string().min(1, {
    message: 'Channel name is required'
  }).refine(name => name !== 'general', {
    message: 'Channel name cannot be "general"' // Field for reserved name(s)
  }),
  type: z.nativeEnum(ChannelType),
  topic: z.string().optional() // Topic *Currently* optional TODO: Make required when sensible
});

export const ServerTemplateCreateSchema = z.object({
  serverName: z.string().min(1, {
    message: 'Server template name is required'
  }),
  description: z.string().optional(),
  serverImageUrl: z.string().url({ message: 'Invalid URL for server image' }).optional(),
  channels: z.array(ServerTemplateChannelSchema).default([]), // Allows empty array, defaults to empty
  botTemplateIds: z.array(z.string().uuid({ message: 'Invalid Bot Template ID' })).min(2, { message: 'Server template must include at least two bot templates' }),
  isPublic: z.boolean().default(true).optional()
});