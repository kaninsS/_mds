import { Heading, Text } from "@medusajs/ui"
import { CheckCircleSolid, FlyingBox, ReplaySolid } from "@medusajs/icons"

const Benefits = () => {
    return (
        <div className="border-b border-ui-border-base bg-white">
            <div className="content-container py-12">
                <div className="grid grid-cols-1 gap-y-8 md:grid-cols-3 md:gap-x-8">
                    {/* Benefit 1 */}
                    <div className="flex flex-col items-center text-center gap-y-4 px-4">
                        <div className="flex bg-ui-bg-base p-4 rounded-full border border-ui-border-base shadow-borders-base">
                            <FlyingBox className="text-ui-fg-base w-6 h-6" />
                        </div>
                        <div>
                            <Heading level="h3" className="text-lg font-semibold text-ui-fg-base mb-2">
                                Free Worldwide Shipping
                            </Heading>
                            <Text className="text-ui-fg-subtle text-base">
                                Enjoy complimentary shipping on all orders over $150. Fast, reliable delivery to your door.
                            </Text>
                        </div>
                    </div>

                    {/* Benefit 2 */}
                    <div className="flex flex-col items-center text-center gap-y-4 px-4">
                        <div className="flex bg-ui-bg-base p-4 rounded-full border border-ui-border-base shadow-borders-base">
                            <CheckCircleSolid className="text-ui-fg-base w-6 h-6" />
                        </div>
                        <div>
                            <Heading level="h3" className="text-lg font-semibold text-ui-fg-base mb-2">
                                Premium Quality Guarantee
                            </Heading>
                            <Text className="text-ui-fg-subtle text-base">
                                Every piece is crafted with meticulous attention to detail using the finest materials available.
                            </Text>
                        </div>
                    </div>

                    {/* Benefit 3 */}
                    <div className="flex flex-col items-center text-center gap-y-4 px-4">
                        <div className="flex bg-ui-bg-base p-4 rounded-full border border-ui-border-base shadow-borders-base">
                            <ReplaySolid className="text-ui-fg-base w-6 h-6" />
                        </div>
                        <div>
                            <Heading level="h3" className="text-lg font-semibold text-ui-fg-base mb-2">
                                Hassle-Free Returns
                            </Heading>
                            <Text className="text-ui-fg-subtle text-base">
                                Not perfectly satisfied? We offer easy, no-questions-asked returns within 30 days of purchase.
                            </Text>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Benefits
