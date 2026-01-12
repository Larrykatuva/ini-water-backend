import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private readonly cloudProvider: string | undefined;
  private readonly s3: S3Client;
  private readonly bucketName: string | undefined;

  constructor(private configService: ConfigService) {
    this.cloudProvider =
      this.configService.get<string>('CLOUD_PROVIDER') ?? 'AWS';

    if (this.cloudProvider === 'AWS') {
      this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
      this.s3 = new S3Client([
        {
          region: this.configService.get<string>('AWS_REGION'),
          credentials: {
            accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
            secretAccessKey: this.configService.get<string>(
              'AWS_SECRET_ACCESS_KEY',
            ),
          },
        },
      ]);
    }
  }

  getFileName(filename: string): string {
    const datePart = new Date().toISOString().replace(/[:.]/g, '-');
    return `${this.cloudProvider}-${datePart}-${filename}`;
  }

  getPublicUrl(fileName: string): string {
    return `https://${this.bucketName}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${fileName}`;
  }

  async uploadFile(
    file: Express.Multer.File,
    fileName: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: file.buffer, // Multer stores file buffer in memory
      ContentType: file.mimetype,
    });

    await this.s3.send(command);
    return this.getPublicUrl(fileName);
  }

  async getFileSignedUrl(fileName: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
    });

    const signedUrl = await getSignedUrl(this.s3, command, {
      expiresIn: 3600, // 1 hour
    });

    return signedUrl;
  }
}
