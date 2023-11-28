namespace Azure_Backend
{
    public class AzureStorageAccount
    {
        const string AccountNameSetting = "AccountName";
        const string AccessKeySetting = "AccessKey";
        const string FileManagerBlobContainerNameSetting = "FileManagerBlobContainerName";
        const string FileUploaderBlobContainerNameSetting = "FileUploaderBlobContainerName";

#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.
        public static AzureStorageAccount FileManager { get; private set; }
#pragma warning restore CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.
#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.
        public static AzureStorageAccount FileUploader { get; private set; }
#pragma warning restore CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.

        public static void Load(IConfigurationSection config)
        {
            FileManager = new AzureStorageAccount
            {
                AccountName = config[AccountNameSetting],
                AccessKey = config[AccessKeySetting],
                ContainerName = config[FileManagerBlobContainerNameSetting]
            };

            FileUploader = new AzureStorageAccount
            {
                AccountName = config[AccountNameSetting],
                AccessKey = config[AccessKeySetting],
                ContainerName = config[FileUploaderBlobContainerNameSetting]
            };
        }

        public string? AccountName { get; set; }
        public string? AccessKey { get; set; }
        public string? ContainerName { get; set; }

        public bool IsEmpty()
        {
            return string.IsNullOrEmpty(AccountName) || string.IsNullOrEmpty(AccessKey) || string.IsNullOrEmpty(ContainerName);
        }
    }
}
