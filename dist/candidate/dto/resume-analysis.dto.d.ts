export declare class ResumeParseRequestDto {
    resumeId?: string;
    filePath?: string;
    forceReparse?: boolean;
}
export declare class ResumeParseResponseDto {
    success: boolean;
    extractedData: {
        personalInfo: {
            name: string;
            email: string;
            phone: string;
            location: string;
        };
        experience: {
            company: string;
            position: string;
            duration: string;
            description: string;
        }[];
        education: {
            institution: string;
            degree: string;
            field: string;
            graduationYear: string;
        }[];
        skills: string[];
        summary: string;
    };
    confidence: number;
    message: string;
}
export declare class ResumeAnalysisResponseDto {
    resumeId: string;
    overallScore: number;
    sections: {
        personalInfo: {
            score: number;
            completeness: number;
            issues: string[];
        };
        experience: {
            score: number;
            relevance: number;
            achievements: number;
            issues: string[];
        };
        education: {
            score: number;
            relevance: number;
            issues: string[];
        };
        skills: {
            score: number;
            relevance: number;
            diversity: number;
            issues: string[];
        };
        summary: {
            score: number;
            length: number;
            impact: number;
            issues: string[];
        };
    };
    recommendations: {
        priority: 'HIGH' | 'MEDIUM' | 'LOW';
        category: string;
        suggestion: string;
        impact: string;
    }[];
    strengths: string[];
    weaknesses: string[];
    atsCompatibility: {
        score: number;
        issues: string[];
        suggestions: string[];
    };
    analyzedAt: Date;
}
export declare class ResumeOptimizationResponseDto {
    resumeId: string;
    optimizationSuggestions: {
        category: string;
        priority: 'HIGH' | 'MEDIUM' | 'LOW';
        current: string;
        suggested: string;
        reason: string;
        impact: string;
    }[];
    keywordOptimization: {
        missing: string[];
        overused: string[];
        suggested: string[];
    };
    formattingSuggestions: {
        issue: string;
        suggestion: string;
        impact: string;
    }[];
    lengthOptimization: {
        currentLength: number;
        recommendedLength: number;
        suggestions: string[];
    };
    atsOptimization: {
        score: number;
        improvements: string[];
    };
    generatedAt: Date;
}
